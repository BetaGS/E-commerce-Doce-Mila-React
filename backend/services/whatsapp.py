"""WhatsApp: link oficial wa.me (cliente -> confeitaria) e Cloud API (aviso para a confeitaria)."""
import json
import re
import threading
from urllib.parse import quote

import requests
from flask import current_app

GRAPH = "https://graph.facebook.com/v21.0"
MAX_MESSAGE = 1500  # mantém o link wa.me num tamanho seguro


def brl(cents):
    return "R$ " + f"{cents / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def br_date(iso):
    y, m, d = iso.split("-")
    return f"{d}/{m}/{y}"


def br_phone(digits):
    d = re.sub(r"\D", "", digits or "")
    return f"({d[:2]}) {d[2:7]}-{d[7:]}" if len(d) == 11 else f"({d[:2]}) {d[2:6]}-{d[6:]}" if len(d) == 10 else d


def wa_link(number, text):
    return f"https://wa.me/{number}?text={quote(text)}"


def _item_line(item):
    extras = " | ".join(
        f"{s['label']}: {', '.join(s['value']) if isinstance(s['value'], list) else s['value']}"
        for s in item["selections"])
    line = f"• {item['quantity']}x {item['name']}"
    if extras:
        line += f" ({extras})"
    return f"{line} - {brl(item['line_total_cents'])}"


def order_message(order, items):
    """Texto que o cliente envia à confeitaria. `order` é a linha do banco; `items` já vem do order_json."""
    where = "*Retirada:* na Tijuca" if order["fulfillment"] == "pickup" else f"*Entrega:* {order['address']}"
    when = br_date(order["delivery_date"]) + (f" às {order['delivery_time']}" if order["delivery_time"] else "")
    head = (f"Olá! Fiz o pedido *#{order['id']}* no site da Doce Mila.\n\n"
            f"*Cliente:* {order['customer_name']} - {br_phone(order['customer_phone'])}\n"
            f"*Data:* {when}\n{where}\n\n"
            f"*Itens:*\n")
    total_pct = round(order["due_now_cents"] * 100 / order["subtotal_cents"]) if order["subtotal_cents"] else 0
    tail = f"\n\n*Total:* {brl(order['subtotal_cents'])}\n*Sinal ({total_pct}%):* {brl(order['due_now_cents'])}"
    if order["needs_review"]:
        tail += "\n(Alguns itens têm valor sujeito à decoração.)"
    if order["notes"]:
        tail += f"\n*Obs.:* {order['notes']}"
    tail += "\n\nGostaria de combinar o pagamento. Obrigado(a)!"

    lines, budget = [], MAX_MESSAGE - len(head) - len(tail) - 80
    for i, item in enumerate(items):
        line = _item_line(item)
        if len("\n".join(lines + [line])) > budget:
            lines.append(f"• ... e mais {len(items) - i} item(ns). Pedido completo: #{order['id']}")
            break
        lines.append(line)
    return head + "\n".join(lines) + tail


def contact_message(data):
    return (f"Olá! Vim pelo site da Doce Mila.\n\n*Nome:* {data['name']}\n*Telefone:* {br_phone(data['phone'])}\n"
            f"*E-mail:* {data['email']}\n*Assunto:* {data['subject']}\n\n*Mensagem:* {data['message']}")


# ---------------- Cloud API (aviso para a confeitaria) ----------------
def cloud_enabled(cfg):
    return all(cfg.get(k) for k in ("WA_CLOUD_TOKEN", "WA_PHONE_NUMBER_ID", "WA_NOTIFY_TO"))


def _flat(text, limit=900):
    # Variáveis de template não aceitam quebras de linha
    return re.sub(r"\s*\n\s*", " | ", text).strip()[:limit]


def send_cloud_message(cfg, title, text):
    if cfg["WA_TEMPLATE_NAME"]:
        message = {"type": "template", "template": {
            "name": cfg["WA_TEMPLATE_NAME"], "language": {"code": cfg["WA_TEMPLATE_LANG"]},
            "components": [{"type": "body", "parameters": [
                {"type": "text", "text": _flat(title, 120)}, {"type": "text", "text": _flat(text)}]}]}}
    else:  # texto livre só chega se o destinatário falou com o número nas últimas 24h
        message = {"type": "text", "text": {"body": f"{title}\n{text}"[:3000]}}
    body = {"messaging_product": "whatsapp", "to": cfg["WA_NOTIFY_TO"], **message}
    resp = requests.post(f"{GRAPH}/{cfg['WA_PHONE_NUMBER_ID']}/messages", data=json.dumps(body), timeout=15,
                         headers={"Authorization": f"Bearer {cfg['WA_CLOUD_TOKEN']}", "Content-Type": "application/json"})
    if resp.status_code >= 300:
        raise RuntimeError(f"WhatsApp Cloud API {resp.status_code}: {resp.text[:300]}")


def notify_owner(title, text):
    """Avisa a confeitaria sem atrasar nem derrubar a requisição do cliente."""
    app = current_app._get_current_object()
    cfg = dict(app.config)
    if not cloud_enabled(cfg):
        return

    def run():
        try:
            send_cloud_message(cfg, title, text)
        except Exception as exc:  # noqa: BLE001 - aviso é opcional; só registramos
            app.logger.error("Aviso WhatsApp falhou: %s", exc)

    if app.config.get("TESTING"):
        run()
    else:
        threading.Thread(target=run, daemon=True).start()
