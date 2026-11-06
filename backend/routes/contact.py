import re

from flask import Blueprint, current_app, jsonify, request

from db import get_db
from security import EMAIL_RE, api_error, register_failure, too_many_attempts
from services import whatsapp as wa

bp = Blueprint("contact", __name__, url_prefix="/api")
SUBJECTS = ("Dúvida", "Encomenda", "Reclamação", "Outro")


@bp.post("/contact")
def send_contact():
    """Guarda a mensagem, avisa a confeitaria (Cloud API, se configurada) e devolve o link wa.me."""
    key = f"contact|{request.remote_addr}"
    if too_many_attempts(key):
        return api_error("Muitas mensagens em pouco tempo. Tente novamente mais tarde.", 429)

    data = request.get_json(silent=True) or {}
    clean = {
        "name": (data.get("name") or "").strip()[:80],
        "email": (data.get("email") or "").strip()[:120],
        "phone": re.sub(r"\D", "", data.get("phone") or ""),
        "subject": (data.get("subject") or "").strip(),
        "message": (data.get("message") or "").strip()[:1000],
    }
    errors = {}
    if len(clean["name"]) < 2:
        errors["name"] = "Nome é obrigatório"
    if not EMAIL_RE.match(clean["email"]):
        errors["email"] = "Email inválido"
    if len(clean["phone"]) not in (10, 11):
        errors["phone"] = "Telefone inválido"
    if clean["subject"] not in SUBJECTS:
        errors["subject"] = "Assunto é obrigatório"
    if len(clean["message"]) < 5:
        errors["message"] = "Mensagem muito curta"
    if errors:
        return api_error("Confira os campos.", 400, fields=errors)

    register_failure(key)  # conta cada envio para limitar spam
    db = get_db()
    db.execute("INSERT INTO contacts (name,email,phone,subject,message) VALUES (?,?,?,?,?)",
               (clean["name"], clean["email"], clean["phone"], clean["subject"], clean["message"]))
    db.commit()
    text = wa.contact_message(clean)
    wa.notify_owner("Novo contato pelo site", f"{clean['name']} ({wa.br_phone(clean['phone'])}) - {clean['subject']}: {clean['message']}")
    return jsonify(ok=True, whatsapp_url=wa.wa_link(current_app.config["WHATSAPP_NUMBER"], text)), 201
