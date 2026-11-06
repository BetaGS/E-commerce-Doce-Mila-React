import re
import sqlite3

from flask import Blueprint, g, request

from db import get_db
from security import (EMAIL_RE, api_error, clear_failures, create_token, hash_password, login_required,
                      register_failure, too_many_attempts, user_json, verify_password)
from flask import jsonify

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _digits(value):
    return re.sub(r"\D", "", value or "")


@bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = _digits(data.get("phone"))
    password = data.get("password") or ""

    errors = {}
    if len(name) < 2:
        errors["name"] = "Informe seu nome."
    if not EMAIL_RE.match(email):
        errors["email"] = "E-mail inválido."
    if len(phone) not in (10, 11):
        errors["phone"] = "Telefone inválido. Use DDD + número."
    if len(password) < 8:
        errors["password"] = "A senha deve ter pelo menos 8 caracteres."
    if errors:
        return api_error("Confira os campos.", 400, fields=errors)

    db = get_db()
    try:
        cur = db.execute("INSERT INTO users (name,email,phone,password_hash) VALUES (?,?,?,?)",
                         (name, email, phone, hash_password(password)))
        db.commit()
    except sqlite3.IntegrityError:
        return api_error("Já existe uma conta com esse e-mail.", 409, fields={"email": "E-mail já cadastrado."})
    user = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(user=user_json(user), token=create_token(user["id"])), 201


@bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    key = f"{email}|{request.remote_addr}"
    if too_many_attempts(key):
        return api_error("Muitas tentativas. Tente novamente em alguns minutos.", 429)

    user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if user is None or not verify_password(user["password_hash"], password):
        register_failure(key)
        return api_error("E-mail ou senha incorretos.", 401)
    clear_failures(key)
    return jsonify(user=user_json(user), token=create_token(user["id"]))


@bp.get("/me")
@login_required
def me():
    return jsonify(user=user_json(g.user))


@bp.patch("/me")
@login_required
def update_me():
    """Atualiza nome e telefone. O e-mail não muda aqui (é o login)."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    phone = _digits(data.get("phone"))
    errors = {}
    if len(name) < 2:
        errors["name"] = "Informe seu nome."
    if len(phone) not in (10, 11):
        errors["phone"] = "Telefone inválido. Use DDD + número."
    if errors:
        return api_error("Confira os campos.", 400, fields=errors)
    db = get_db()
    db.execute("UPDATE users SET name = ?, phone = ? WHERE id = ?", (name, phone, g.user["id"]))
    db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (g.user["id"],)).fetchone()
    return jsonify(user=user_json(user))


@bp.post("/password")
@login_required
def change_password():
    data = request.get_json(silent=True) or {}
    current, new = data.get("current_password") or "", data.get("new_password") or ""
    if not verify_password(g.user["password_hash"], current):
        return api_error("Senha atual incorreta.", 400, fields={"current_password": "Senha atual incorreta."})
    if len(new) < 8:
        return api_error("A nova senha deve ter pelo menos 8 caracteres.", 400,
                         fields={"new_password": "Mínimo de 8 caracteres."})
    db = get_db()
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hash_password(new), g.user["id"]))
    db.commit()
    return jsonify(ok=True)
