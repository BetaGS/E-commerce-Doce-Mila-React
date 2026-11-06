import os
from flask import Flask, jsonify, request

app = Flask(__name__)

# Rota de health check para o Render evitar erro 404
@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "API E-commerce Doce Mila rodando com sucesso!"
    }), 200

# Rota de exemplo para listar produtos
@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    produtos = [
        {"id": 1, "name": "Bolo de Morango Especial", "price": 45.00, "image": "bolo-morango.jpg"},
        {"id": 2, "name": "Caixa de Brigadeiros Gourmet", "price": 25.00, "image": "brigadeiros.jpg"},
        {"id": 3, "name": "Cupcake Red Velvet", "price": 12.00, "image": "cupcake.jpg"},
        {"id": 4, "name": "Torta de Limão", "price": 38.00, "image": "torta-limao.jpg"}
    ]
    return jsonify(produtos), 200

if __name__ == '__main__':
    # Garante que escuta em 0.0.0.0 e usa a porta definida pela variavel PORT do Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
