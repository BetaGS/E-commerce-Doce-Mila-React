"""Cartão de débito/crédito via Mercado Pago (Checkout Pro).

Fluxo: criamos uma "preference" -> o cliente paga na página do Mercado Pago ->
o Mercado Pago chama nosso webhook -> consultamos o pagamento na API deles (nunca
confiamos no corpo do webhook) -> só então marcamos o pedido como pago.
"""
import requests

API = "https://api.mercadopago.com"
TIMEOUT = 15

# Tipos de pagamento do MP que ficam bloqueados conforme a forma escolhida no site.
_ALL_TYPES = ["credit_card", "debit_card", "prepaid_card", "ticket", "bank_transfer",
              "account_money", "atm", "digital_currency", "digital_wallet"]


class MercadoPagoError(Exception):
    pass


def _headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def create_preference(cfg, order, charge_cents, method):
    allowed = "debit_card" if method == "card_debit" else "credit_card"
    frontend = cfg["FRONTEND_URL"]
    order_url = f"{frontend}/pedido/{order['id']}"
    body = {
        "items": [{
            "id": f"pedido-{order['id']}",
            "title": f"Doce Mila - pedido #{order['id']}",
            "quantity": 1,
            "currency_id": "BRL",
            "unit_price": round(charge_cents / 100, 2),
        }],
        "payer": {"name": order["customer_name"], "email": order["customer_email"]},
        "external_reference": str(order["id"]),
        "back_urls": {"success": order_url, "pending": order_url, "failure": order_url},
        "statement_descriptor": "DOCE MILA",
        "payment_methods": {
            "excluded_payment_types": [{"id": t} for t in _ALL_TYPES if t != allowed],
            "installments": max(1, cfg["MP_MAX_INSTALLMENTS"]),
        },
    }
    # O MP recusa auto_return/notification_url com endereços locais (http://localhost).
    if frontend.startswith("https://"):
        body["auto_return"] = "approved"
    if cfg["API_PUBLIC_URL"].startswith("https://"):
        body["notification_url"] = f"{cfg['API_PUBLIC_URL']}/api/payments/mercadopago/webhook"
    try:
        resp = requests.post(f"{API}/checkout/preferences", json=body,
                             headers=_headers(cfg["MP_ACCESS_TOKEN"]), timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise MercadoPagoError(f"Falha de rede ao falar com o Mercado Pago: {exc}") from exc
    if resp.status_code not in (200, 201):
        raise MercadoPagoError(f"Mercado Pago recusou a preferência ({resp.status_code}): {resp.text[:300]}")
    data = resp.json()
    return {"id": data["id"], "url": data.get("init_point") or data.get("sandbox_init_point")}


def get_payment(cfg, payment_id):
    try:
        resp = requests.get(f"{API}/v1/payments/{payment_id}",
                            headers=_headers(cfg["MP_ACCESS_TOKEN"]), timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise MercadoPagoError(str(exc)) from exc
    if resp.status_code != 200:
        raise MercadoPagoError(f"Pagamento {payment_id} não encontrado ({resp.status_code}).")
    return resp.json()


def search_approved_payment(cfg, order_id):
    """Usado quando o cliente volta do checkout antes do webhook chegar."""
    try:
        resp = requests.get(f"{API}/v1/payments/search",
                            params={"external_reference": str(order_id), "status": "approved",
                                    "sort": "date_created", "criteria": "desc"},
                            headers=_headers(cfg["MP_ACCESS_TOKEN"]), timeout=TIMEOUT)
    except requests.RequestException as exc:
        raise MercadoPagoError(str(exc)) from exc
    if resp.status_code != 200:
        raise MercadoPagoError(f"Busca de pagamentos falhou ({resp.status_code}).")
    results = resp.json().get("results", [])
    return results[0] if results else None
