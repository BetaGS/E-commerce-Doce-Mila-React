"""Valida o carrinho contra o catálogo e calcula os valores NO SERVIDOR.

O front-end nunca decide preço: ele só envia produto, quantidade e escolhas.
"""
from db import loads

MAX_QTY = 5000
MAX_TEXT = 140


class CartError(ValueError):
    pass


def _clean_selections(product, raw):
    """Devolve [{key,label,value}] validado, ou levanta CartError."""
    raw = raw if isinstance(raw, dict) else {}
    out = []
    for group in loads(product["options_json"], []):
        key, label, kind = group["key"], group["label"], group["type"]
        value = raw.get(key)
        if kind == "single":
            if value in (None, ""):
                if group.get("required", True):
                    raise CartError(f"{product['name']}: escolha uma opção em “{label}”.")
                continue
            if value not in group["choices"]:
                raise CartError(f"{product['name']}: opção inválida em “{label}”.")
            out.append({"key": key, "label": label, "value": value})
        elif kind == "multi":
            values = value if isinstance(value, list) else ([] if value in (None, "") else [value])
            if len(set(values)) != len(values) or any(v not in group["choices"] for v in values):
                raise CartError(f"{product['name']}: opção inválida em “{label}”.")
            if len(values) < group.get("min", 0) or len(values) > group.get("max", len(group["choices"])):
                raise CartError(
                    f"{product['name']}: em “{label}” escolha entre {group.get('min', 0)} e {group['max']} opções.")
            if values:
                out.append({"key": key, "label": label, "value": values})
        else:  # text
            value = (value or "").strip() if isinstance(value, str) else ""
            if not value:
                if group.get("required", True):
                    raise CartError(f"{product['name']}: preencha “{label}”.")
                continue
            out.append({"key": key, "label": label, "value": value[:MAX_TEXT]})
    return out


def build_items(db, raw_items):
    if not isinstance(raw_items, list) or not raw_items:
        raise CartError("Seu carrinho está vazio.")
    items = []
    for raw in raw_items[:50]:
        try:
            product_id, qty = int(raw.get("product_id")), int(raw.get("quantity"))
        except (TypeError, ValueError, AttributeError):
            raise CartError("Item do carrinho inválido.")
        product = db.execute("SELECT * FROM products WHERE id = ? AND active = 1", (product_id,)).fetchone()
        if product is None:
            raise CartError("Um dos produtos não está mais disponível.")
        if product["price_cents"] is None:
            raise CartError(f"“{product['name']}” é sob consulta: peça o orçamento pelo WhatsApp.")
        if qty < product["min_qty"]:
            raise CartError(f"{product['name']}: quantidade mínima de {product['min_qty']} unidades.")
        if qty > MAX_QTY:
            raise CartError(f"{product['name']}: quantidade acima do limite.")
        items.append({
            "product_id": product["id"], "name": product["name"],
            "unit_price_cents": product["price_cents"], "quantity": qty,
            "deposit_percent": product["deposit_percent"],
            "variable_price": bool(product["variable_price"]),
            "selections": _clean_selections(product, raw.get("selections")),
            "line_total_cents": product["price_cents"] * qty,
        })
    return items


def totals(items, method, cfg):
    subtotal = sum(i["line_total_cents"] for i in items)
    due_now = sum(-(-i["line_total_cents"] * i["deposit_percent"] // 100) for i in items)  # arredonda p/ cima
    bps = {"card_debit": cfg["CARD_FEE_DEBIT_BPS"], "card_credit": cfg["CARD_FEE_CREDIT_BPS"]}.get(method, 0)
    fee = (due_now * bps + 5000) // 10000
    return {"subtotal_cents": subtotal, "due_now_cents": due_now, "card_fee_cents": fee,
            "charge_cents": due_now + fee}
