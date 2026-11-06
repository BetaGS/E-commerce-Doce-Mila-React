import re
import unicodedata

from flask import Blueprint, current_app, jsonify, request

from db import get_db, loads
from security import api_error

bp = Blueprint("catalog", __name__, url_prefix="/api")


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def product_json(row):
    return {
        "id": row["id"], "slug": row["slug"], "name": row["name"], "category": row["category"],
        "category_slug": slugify(row["category"]), "description": row["description"],
        "notes": row["notes"], "image": row["image"], "gallery": loads(row["gallery_json"], []),
        "price_cents": row["price_cents"], "price_note": row["price_note"],
        "price_from": bool(row["price_from"]), "variable_price": bool(row["variable_price"]),
        "min_qty": row["min_qty"], "deposit_percent": row["deposit_percent"],
        "options": loads(row["options_json"], []), "is_new": bool(row["is_new"]),
        "active": bool(row["active"]), "availability_note": row["availability_note"],
    }


@bp.get("/products")
def list_products():
    rows = get_db().execute("SELECT * FROM products WHERE active = 1 ORDER BY sort_order, id").fetchall()
    return jsonify(products=[product_json(r) for r in rows])


@bp.get("/products/<slug>")
def get_product(slug):
    row = get_db().execute("SELECT * FROM products WHERE slug = ? AND active = 1", (slug,)).fetchone()
    if row is None:
        return api_error("Produto não encontrado.", 404)
    return jsonify(product=product_json(row))


@bp.get("/categories")
def list_categories():
    rows = get_db().execute(
        "SELECT category, COUNT(*) AS n, MIN(sort_order) AS first FROM products WHERE active = 1 "
        "GROUP BY category ORDER BY first").fetchall()
    return jsonify(categories=[{"name": r["category"], "slug": slugify(r["category"]), "count": r["n"]}
                               for r in rows])


@bp.get("/config")
def public_config():
    cfg = current_app.config
    return jsonify(
        pix_enabled=bool(cfg["PIX_KEY"]),
        card_enabled=bool(cfg["MP_ACCESS_TOKEN"]),
        card_fee_debit_percent=cfg["CARD_FEE_DEBIT_BPS"] / 100,
        card_fee_credit_percent=cfg["CARD_FEE_CREDIT_BPS"] / 100,
        min_lead_days=cfg["MIN_LEAD_DAYS"],
        whatsapp_number=cfg["WHATSAPP_NUMBER"],
        pickup_info="Tijuca, perto da Rua Uruguai (endereço completo combinado pelo WhatsApp).",
    )
