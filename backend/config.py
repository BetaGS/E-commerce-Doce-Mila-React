"""Configuração lida de variáveis de ambiente (ou do arquivo .env)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _load_env_file():
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file()


def _int(name, default):
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


def load_config():
    db_path = Path(os.environ.get("DATABASE_PATH", "instance/docemila.db"))
    if not db_path.is_absolute():
        db_path = BASE_DIR / db_path
    return {
        "SECRET_KEY": os.environ.get("SECRET_KEY", "dev-only-change-me"),
        "DATABASE_PATH": str(db_path),
        "JWT_EXPIRES_DAYS": _int("JWT_EXPIRES_DAYS", 7),
        "CORS_ORIGINS": [o.strip() for o in os.environ.get(
            "CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()],
        "FRONTEND_URL": os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
        "API_PUBLIC_URL": os.environ.get("API_PUBLIC_URL", "").rstrip("/"),
        "PIX_KEY": os.environ.get("PIX_KEY", ""),
        "PIX_MERCHANT_NAME": os.environ.get("PIX_MERCHANT_NAME", "DOCE MILA"),
        "PIX_CITY": os.environ.get("PIX_CITY", "RIO DE JANEIRO"),
        "MP_ACCESS_TOKEN": os.environ.get("MP_ACCESS_TOKEN", ""),
        "MP_MAX_INSTALLMENTS": _int("MP_MAX_INSTALLMENTS", 1),
        "CARD_FEE_DEBIT_BPS": _int("CARD_FEE_DEBIT_BPS", 500),
        "CARD_FEE_CREDIT_BPS": _int("CARD_FEE_CREDIT_BPS", 700),
        "MIN_LEAD_DAYS": _int("MIN_LEAD_DAYS", 2),
        "WHATSAPP_NUMBER": os.environ.get("WHATSAPP_NUMBER", "5521996911177"),
        # WhatsApp Business Cloud API (opcional): avisa a confeitaria de pedidos/contatos novos
        "WA_CLOUD_TOKEN": os.environ.get("WA_CLOUD_TOKEN", ""),
        "WA_PHONE_NUMBER_ID": os.environ.get("WA_PHONE_NUMBER_ID", ""),
        "WA_NOTIFY_TO": os.environ.get("WA_NOTIFY_TO", ""),
        "WA_TEMPLATE_NAME": os.environ.get("WA_TEMPLATE_NAME", ""),
        "WA_TEMPLATE_LANG": os.environ.get("WA_TEMPLATE_LANG", "pt_BR"),
    }
