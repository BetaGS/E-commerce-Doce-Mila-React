from flask import Blueprint, current_app, jsonify, request

from db import get_db
from routes.orders import apply_mp_payment
from services import mercadopago as mp

bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@bp.route("/mercadopago/webhook", methods=["POST", "GET"])
def mercadopago_webhook():
    """O Mercado Pago só avisa que "algo aconteceu". Quem decide se foi pago é a consulta à API deles."""
    cfg = current_app.config
    if not cfg["MP_ACCESS_TOKEN"]:
        return jsonify(ok=False), 503

    body = request.get_json(silent=True) or {}
    kind = request.args.get("type") or request.args.get("topic") or body.get("type") or body.get("topic")
    payment_id = request.args.get("data.id") or (body.get("data") or {}).get("id")
    if payment_id is None and kind == "payment":
        payment_id = request.args.get("id")
    if kind != "payment" or not payment_id:
        return jsonify(ok=True, ignored=True)

    try:
        payment = mp.get_payment(cfg, payment_id)
    except mp.MercadoPagoError as exc:
        current_app.logger.error("webhook MP: %s", exc)
        return jsonify(ok=False), 502  # o Mercado Pago tenta de novo mais tarde
    apply_mp_payment(get_db(), payment)
    return jsonify(ok=True)
