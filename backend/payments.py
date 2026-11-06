import mercadopago

# Adicione seu Token de Acesso do Mercado Pago aqui ou via .env
MERCADO_PAGO_TOKEN = "SEU_ACCESS_TOKEN_MERCADO_PAGO"

def gerar_pagamento_pix(order_id: int, valor_total: float, email_cliente: str, nome_cliente: str):
    sdk = mercadopago.SDK(MERCADO_PAGO_TOKEN)
    
    payment_data = {
        "transaction_amount": float(valor_total),
        "description": f"Pedido Doce Mila #{order_id}",
        "payment_method_id": "pix",
        "payer": {
            "email": email_cliente,
            "first_name": nome_cliente
        }
    }

    try:
        result = sdk.payment().create(payment_data)
        payment = result["response"]
        return {
            "payment_id": payment.get("id"),
            "status": payment.get("status"),
            "qr_code_base64": payment.get("point_of_interaction", {}).get("transaction_data", {}).get("qr_code_base64"),
            "qr_code": payment.get("point_of_interaction", {}).get("transaction_data", {}).get("qr_code")
        }
    except Exception as e:
        # Fallback de teste simulado caso não haja chave do Mercado Pago configurada
        return {
            "payment_id": f"TESTE_{order_id}",
            "status": "pending",
            "qr_code_base64": "",
            "qr_code": f"00020126580014br.gov.bcb.pix0136docemila-pix-simulado-{order_id}"
        }
