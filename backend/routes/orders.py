import json
from datetime import date, datetime, timedelta, timezone

from flask import Blueprint, current_app, g, jsonify, request

from db import get_db, loads, now_utc
from security import api_error, login_required
from services import mercadopago as mp
from services import whatsapp as wa
from services.pix import build_pix_payload
from services.pricing import CartError, build_items, totals

bp = Blueprint("orders", __name__, url_prefix="/api")

METHODS = ("whatsapp", "pix", "card_debit", "card_credit")
BRT = timezone(timedelta(hours=-3))  # Brasil não tem horário de verão desde 2019


def today_brt():
    return datetime.now(BRT).date()


def order_items(db, order_id):
    rows = db.execute("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", (order_id,)).fetchall()
    return [{"product_id": r["product_id"], "name": r["name"], "quantity": r["quantity"],
             "unit_price_cents": r["unit_price_cents"], "line_total_cents": r["line_total_cents"],
             "deposit_percent": r["deposit_percent"], "selections": loads(r["selections_json"], [])}
            for r in rows]


def order_json(db, row):
    charge = row["due_now_cents"] + row["card_fee_cents"]
    data = {
        "id": row["id"], "status": row["status"], "created_at": row["created_at"],
        "customer_name": row["customer_name"], "customer_phone": row["customer_phone"],
        "customer_email": row["customer_email"], "fulfillment": row["fulfillment"],
        "delivery_date": row["delivery_date"], "delivery_time": row["delivery_time"],
        "address": row["address"], "notes": row["notes"], "needs_review": bool(row["needs_review"]),
        "subtotal_cents": row["subtotal_cents"], "due_now_cents": row["due_now_cents"],
        "remaining_cents": row["subtotal_cents"] - row["due_now_cents"],
        "card_fee_cents": row["card_fee_cents"], "charge_cents": charge,
        "payment_method": row["payment_method"], "paid_cents": row["paid_cents"],
        "paid_at": row["paid_at"], "items": order_items(db, row["id"]), "payment": None,
    }
    if row["status"] == "pending_payment":
        data["payment"] = payment_instructions(row, charge, data["items"])
    return data


def payment_instructions(row, charge, items):
    cfg = current_app.config
    if row["payment_method"] == "whatsapp":
        return {"method": "whatsapp", "amount_cents": row["due_now_cents"],
                "whatsapp_url": wa.wa_link(cfg["WHATSAPP_NUMBER"], wa.order_message(row, items))}
    if row["payment_method"] == "pix":
        if not cfg["PIX_KEY"]:
            return {"method": "pix", "error": "Pix indisponível no momento."}
        payload = build_pix_payload(cfg["PIX_KEY"], charge, cfg["PIX_MERCHANT_NAME"], cfg["PIX_CITY"],
                                    f"DM{row['id']:06d}")
        return {"method": "pix", "amount_cents": charge, "pix_payload": payload}
    return {"method": row["payment_method"], "amount_cents": charge, "checkout_url": row["mp_checkout_url"]}


def start_payment(db, order_id, method):
    """Prepara a cobrança. Retorna mensagem de erro (str) ou None."""
    cfg = current_app.config
    order = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    fee = (order["due_now_cents"] * {"card_debit": cfg["CARD_FEE_DEBIT_BPS"],
                                     "card_credit": cfg["CARD_FEE_CREDIT_BPS"]}.get(method, 0) + 5000) // 10000
    db.execute("UPDATE orders SET payment_method = ?, card_fee_cents = ?, mp_checkout_url = NULL, "
               "mp_preference_id = NULL WHERE id = ?", (method, fee, order_id))
    db.commit()
    if method in ("pix", "whatsapp"):
        return None
    order = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    try:
        pref = mp.create_preference(cfg, order, order["due_now_cents"] + fee, method)
    except mp.MercadoPagoError as exc:
        current_app.logger.error("Mercado Pago: %s", exc)
        return "Não foi possível abrir o pagamento por cartão agora. Tente novamente ou escolha Pix."
    db.execute("UPDATE orders SET mp_preference_id = ?, mp_checkout_url = ? WHERE id = ?",
               (pref["id"], pref["url"], order_id))
    db.commit()
    return None


def method_available(method):
    cfg = current_app.config
    if method == "whatsapp":
        return True
    if method == "pix":
        return bool(cfg["PIX_KEY"])
    return method in METHODS and bool(cfg["MP_ACCESS_TOKEN"])


def mark_paid(db, order, paid_cents, mp_payment_id=None):
    if order["status"] != "pending_payment":
        return False
    db.execute("UPDATE orders SET status = 'confirmed', paid_cents = ?, paid_at = ?, "
               "mp_payment_id = COALESCE(?, mp_payment_id) WHERE id = ?",
               (paid_cents, now_utc(), mp_payment_id, order["id"]))
    db.commit()
    return True


def apply_mp_payment(db, payment):
    """Confere um pagamento vindo da API do Mercado Pago e confirma o pedido se tudo bate."""
    try:
        order_id = int(payment.get("external_reference"))
    except (TypeError, ValueError):
        return False
    order = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if order is None or payment.get("status") != "approved" or payment.get("currency_id") != "BRL":
        return False
    paid = round(float(payment.get("transaction_amount", 0)) * 100)
    if paid < order["due_now_cents"] + order["card_fee_cents"]:
        current_app.logger.warning("Pedido %s: valor pago %s menor que o devido", order_id, paid)
        return False
    return mark_paid(db, order, paid, str(payment.get("id")))


@bp.post("/orders")
@login_required
def create_order():
    data = request.get_json(silent=True) or {}
    cfg, db = current_app.config, get_db()

    method = data.get("payment_method", "whatsapp")
    if method not in METHODS or not method_available(method):
        return api_error("Forma de pagamento indisponível.", 400)

    fulfillment = data.get("fulfillment")
    if fulfillment not in ("pickup", "delivery"):
        return api_error("Escolha retirada ou entrega.", 400)
    address = (data.get("address") or "").strip()[:300]
    if fulfillment == "delivery" and len(address) < 8:
        return api_error("Informe o endereço completo para a entrega.", 400)

    try:
        delivery_date = date.fromisoformat(data.get("delivery_date", ""))
    except ValueError:
        return api_error("Informe a data do pedido.", 400)
    earliest = today_brt() + timedelta(days=cfg["MIN_LEAD_DAYS"])
    if delivery_date < earliest:
        return api_error(f"Encomendas precisam de pelo menos {cfg['MIN_LEAD_DAYS']} dias de antecedência.", 400)

    try:
        items = build_items(db, data.get("items"))
    except CartError as exc:
        return api_error(str(exc), 400)
    t = totals(items, method, cfg)

    cur = db.execute(
        """INSERT INTO orders (user_id,customer_name,customer_phone,customer_email,fulfillment,delivery_date,
             delivery_time,address,notes,needs_review,subtotal_cents,due_now_cents,payment_method)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (g.user["id"], g.user["name"], g.user["phone"], g.user["email"], fulfillment,
         delivery_date.isoformat(), (data.get("delivery_time") or "")[:40], address,
         (data.get("notes") or "").strip()[:500], int(any(i["variable_price"] for i in items)),
         t["subtotal_cents"], t["due_now_cents"], method))
    order_id = cur.lastrowid
    db.executemany(
        """INSERT INTO order_items (order_id,product_id,name,unit_price_cents,quantity,deposit_percent,
             selections_json,line_total_cents) VALUES (?,?,?,?,?,?,?,?)""",
        [(order_id, i["product_id"], i["name"], i["unit_price_cents"], i["quantity"], i["deposit_percent"],
          json.dumps(i["selections"], ensure_ascii=False), i["line_total_cents"]) for i in items])
    db.commit()

    payment_error = start_payment(db, order_id, method)
    row = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    wa.notify_owner(f"Novo pedido #{order_id}",
                    f"{g.user['name']} - {wa.brl(t['subtotal_cents'])} (sinal {wa.brl(t['due_now_cents'])}) - "
                    f"para {wa.br_date(delivery_date.isoformat())} - pagamento: {method}")
    return jsonify(order=order_json(db, row), payment_error=payment_error), 201


def _owned_order(order_id):
    row = get_db().execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if row is None or (row["user_id"] != g.user["id"] and not g.user["is_admin"]):
        return None
    return row


@bp.get("/orders")
@login_required
def my_orders():
    db = get_db()
    rows = db.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", (g.user["id"],)).fetchall()
    return jsonify(orders=[order_json(db, r) for r in rows])


@bp.get("/orders/<int:order_id>")
@login_required
def get_order(order_id):
    row = _owned_order(order_id)
    if row is None:
        return api_error("Pedido não encontrado.", 404)
    return jsonify(order=order_json(get_db(), row))


@bp.post("/orders/<int:order_id>/payment")
@login_required
def change_payment(order_id):
    """Trocar a forma de pagamento (ou tentar de novo) enquanto o pedido não foi pago."""
    row = _owned_order(order_id)
    if row is None:
        return api_error("Pedido não encontrado.", 404)
    if row["status"] != "pending_payment":
        return api_error("Este pedido não está aguardando pagamento.", 409)
    method = (request.get_json(silent=True) or {}).get("payment_method")
    if method not in METHODS or not method_available(method):
        return api_error("Forma de pagamento indisponível.", 400)
    db = get_db()
    error = start_payment(db, order_id, method)
    row = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    return jsonify(order=order_json(db, row), payment_error=error)


@bp.post("/orders/<int:order_id>/sync")
@login_required
def sync_order(order_id):
    """Cliente voltou do checkout do cartão: confere no Mercado Pago sem esperar o webhook."""
    row = _owned_order(order_id)
    if row is None:
        return api_error("Pedido não encontrado.", 404)
    db = get_db()
    if row["status"] == "pending_payment" and row["payment_method"].startswith("card") and current_app.config["MP_ACCESS_TOKEN"]:
        try:
            payment = mp.search_approved_payment(current_app.config, order_id)
            if payment:
                apply_mp_payment(db, payment)
        except mp.MercadoPagoError as exc:
            current_app.logger.warning("sync pedido %s: %s", order_id, exc)
        row = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    return jsonify(order=order_json(db, row))
