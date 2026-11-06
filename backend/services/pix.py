"""Gera o "Pix Copia e Cola" (BR Code estático) a partir da chave Pix da loja.

A confirmação é manual: o valor cai direto na conta da confeiteira e ela confirma o
pagamento no painel /admin. Para confirmação automática use o Mercado Pago (cartão).
"""
import re
import unicodedata


def _ascii_upper(text, limit):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^A-Za-z0-9 ]", "", text).strip().upper()
    return text[:limit]


def _field(field_id, value):
    return f"{field_id}{len(value):02d}{value}"


def crc16(payload: str) -> str:
    """CRC16/CCITT-FALSE exigido pelo padrão EMV do Banco Central."""
    crc = 0xFFFF
    for byte in payload.encode("utf-8"):
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def build_pix_payload(key, amount_cents, merchant_name, city, txid):
    if not key:
        raise ValueError("Chave Pix não configurada.")
    account = _field("00", "br.gov.bcb.pix") + _field("01", key.strip())
    txid = re.sub(r"[^A-Za-z0-9]", "", txid)[:25] or "***"
    payload = (
        _field("00", "01")
        + _field("01", "11")
        + _field("26", account)
        + _field("52", "0000")
        + _field("53", "986")
        + _field("54", f"{amount_cents / 100:.2f}")
        + _field("58", "BR")
        + _field("59", _ascii_upper(merchant_name, 25) or "LOJA")
        + _field("60", _ascii_upper(city, 15) or "BRASIL")
        + _field("62", _field("05", txid))
        + "6304"
    )
    return payload + crc16(payload)
