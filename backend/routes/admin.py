from flask import Blueprint, jsonify, request

from db import get_db
from routes.catalog import product_json
from routes.orders import mark_paid, order_json
from security import admin_required, api_error

bp = Blueprint("admin", __name__, url_prefix="/api/admin")

STATUSES = ("pending_payment", "confirmed", "in_production", "ready", "completed", "cancelled")


@bp.get("/orders")
@admin_required
def list_orders():
    db = get_db()
    status = request.args.get("status")
    if status in STATUSES:
        rows = db.execute("SELECT * FROM orders WHERE status = ? ORDER BY id DESC LIMIT 300", (status,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 300").fetchall()
    return jsonify(orders=[order_json(db, r) for r in rows])


@bp.patch("/orders/<int:order_id>")
@admin_required
def update_order(order_id):
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in STATUSES:
        return api_error("Status inválido.", 400)
    db = get_db()
    if db.execute("SELECT 1 FROM orders WHERE id = ?", (order_id,)).fetchone() is None:
        return api_error("Pedido não encontrado.", 404)
    db.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    db.commit()
    return jsonify(order=order_json(db, db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()))


@bp.post("/orders/<int:order_id>/confirm-payment")
@admin_required
def confirm_payment(order_id):
    """Confirma um Pix conferido no app do banco."""
    db = get_db()
    row = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    if row is None:
        return api_error("Pedido não encontrado.", 404)
    if row["status"] != "pending_payment":
        return api_error("Este pedido não está aguardando pagamento.", 409)
    amount = (request.get_json(silent=True) or {}).get("amount_cents")
    if not isinstance(amount, int) or amount <= 0:
        amount = row["due_now_cents"] + row["card_fee_cents"]
    mark_paid(db, row, amount)
    return jsonify(order=order_json(db, db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()))


@bp.get("/products")
@admin_required
def list_products():
    rows = get_db().execute("SELECT * FROM products ORDER BY sort_order, id").fetchall()
    return jsonify(products=[product_json(r) for r in rows])


@bp.patch("/products/<int:product_id>")
@admin_required
def toggle_product(product_id):
    active = (request.get_json(silent=True) or {}).get("active")
    if not isinstance(active, bool):
        return api_error("Informe active true/false.", 400)
    db = get_db()
    db.execute("UPDATE products SET active = ? WHERE id = ?", (int(active), product_id))
    db.commit()
    row = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if row is None:
        return api_error("Produto não encontrado.", 404)
    return jsonify(product=product_json(row))
