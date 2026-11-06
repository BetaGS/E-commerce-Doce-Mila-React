import logging

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from config import load_config
from db import close_db, get_db, init_db
from seed import seed_products
from routes import admin, auth, catalog, contact, orders, payments


def create_app(overrides=None):
    app = Flask(__name__)
    app.config.update(load_config())
    if overrides:
        app.config.update(overrides)
    logging.basicConfig(level=logging.INFO)

    if app.config["SECRET_KEY"] == "dev-only-change-me" and not app.debug:
        app.logger.warning("SECRET_KEY padrão em uso. Defina uma chave própria no .env antes de publicar.")

    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()
        # Banco novo/vazio: carrega o catálogo sozinho (não é preciso rodar o seed à mão)
        if get_db().execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
            app.logger.info("Catálogo vazio: carregando %s produtos.", seed_products(get_db()))

    for module in (auth, catalog, orders, payments, admin, contact):
        app.register_blueprint(module.bp)

    @app.get("/api/health")
    def health():
        get_db().execute("SELECT 1")
        return jsonify(status="ok")

    # --- CORS: só para as origens configuradas ---
    @app.before_request
    def preflight():
        if request.method == "OPTIONS":
            return ("", 204)

    @app.after_request
    def add_cors(resp):
        origin = request.headers.get("Origin")
        if origin and origin in app.config["CORS_ORIGINS"]:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS"
        return resp

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify(error="Rota não encontrada."), 404

    @app.errorhandler(405)
    def not_allowed(_e):
        return jsonify(error="Método não permitido."), 405

    @app.errorhandler(Exception)
    def unexpected(exc):
        if isinstance(exc, HTTPException):
            return jsonify(error=exc.description), exc.code
        app.logger.exception("Erro inesperado: %s", exc)
        return jsonify(error="Erro interno. Tente novamente."), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
