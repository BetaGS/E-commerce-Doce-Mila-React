import re
import time
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from db import get_db

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def api_error(message, status=400, **extra):
    return jsonify({"error": message, **extra}), status


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password_hash, password):
    return check_password_hash(password_hash, password)


def create_token(user_id):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(days=current_app.config["JWT_EXPIRES_DAYS"]),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def _load_user():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        data = jwt.decode(header[7:], current_app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = int(data["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
    return get_db().execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _load_user()
        if user is None:
            return api_error("Faça login para continuar.", 401)
        g.user = user
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    @login_required
    def wrapper(*args, **kwargs):
        if not g.user["is_admin"]:
            return api_error("Acesso restrito.", 403)
        return fn(*args, **kwargs)
    return wrapper


def user_json(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"],
            "phone": row["phone"], "is_admin": bool(row["is_admin"])}


# Limitador simples de tentativas de login (em memória, por processo).
_attempts = {}
MAX_ATTEMPTS, WINDOW = 5, 15 * 60


def too_many_attempts(key):
    now = time.time()
    _attempts[key] = [t for t in _attempts.get(key, []) if now - t < WINDOW]
    return len(_attempts[key]) >= MAX_ATTEMPTS


def register_failure(key):
    _attempts.setdefault(key, []).append(time.time())


def clear_failures(key):
    _attempts.pop(key, None)
