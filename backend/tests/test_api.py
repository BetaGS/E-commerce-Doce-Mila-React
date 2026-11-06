"""Testes de ponta a ponta da API. Rode com:  python -m unittest discover -s tests -v"""
import os
import sys
import tempfile
import unittest
from datetime import timedelta
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_tmp = tempfile.mkdtemp()
os.environ["DATABASE_PATH"] = os.path.join(_tmp, "boot.db")  # banco descartável para o import de app.py

from app import create_app  # noqa: E402
from db import get_db  # noqa: E402
from routes.orders import today_brt  # noqa: E402
from seed import seed_products  # noqa: E402
from services.pix import crc16  # noqa: E402


class ApiTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "DATABASE_PATH": os.path.join(tempfile.mkdtemp(), "t.db"), "TESTING": True,
            "SECRET_KEY": "test-secret", "PIX_KEY": "loja@docemila.com", "MP_ACCESS_TOKEN": "TEST-token",
            "FRONTEND_URL": "http://localhost:3000", "API_PUBLIC_URL": "",
        })
        with self.app.app_context():
            seed_products(get_db())
        self.c = self.app.test_client()

    # ---- helpers
    def register(self, email="ana@exemplo.com", password="senha1234"):
        r = self.c.post("/api/auth/register", json={"name": "Ana Souza", "email": email,
                                                    "phone": "(21) 99999-1234", "password": password})
        self.assertEqual(r.status_code, 201, r.get_json())
        return r.get_json()["token"]

    def auth(self, token):
        return {"Authorization": f"Bearer {token}"}

    def product(self, slug):
        return self.c.get(f"/api/products/{slug}").get_json()["product"]

    def date_ok(self):
        return (today_brt() + timedelta(days=10)).isoformat()

    def order_body(self, items, **kw):
        body = {"items": items, "fulfillment": "pickup", "delivery_date": self.date_ok(), "payment_method": "pix"}
        body.update(kw)
        return body

    def docinho(self, qty=25, sabor="Oreo"):
        p = self.product("docinhos-gourmet")
        return {"product_id": p["id"], "quantity": qty, "selections": {"sabor": sabor}}

    # ---- auth
    def test_register_login_me(self):
        token = self.register()
        me = self.c.get("/api/auth/me", headers=self.auth(token))
        self.assertEqual(me.get_json()["user"]["phone"], "21999991234")
        ok = self.c.post("/api/auth/login", json={"email": "ANA@exemplo.com", "password": "senha1234"})
        self.assertEqual(ok.status_code, 200)
        bad = self.c.post("/api/auth/login", json={"email": "ana@exemplo.com", "password": "errada123"})
        self.assertEqual(bad.status_code, 401)
        self.assertEqual(self.c.get("/api/auth/me").status_code, 401)

    def test_profile_update_and_password(self):
        h = self.auth(self.register())
        r = self.c.patch("/api/auth/me", json={"name": "Ana Maria", "phone": "(21) 98888-7777"}, headers=h)
        self.assertEqual(r.get_json()["user"]["phone"], "21988887777")
        self.assertEqual(self.c.patch("/api/auth/me", json={"name": "", "phone": "1"}, headers=h).status_code, 400)
        bad = self.c.post("/api/auth/password", json={"current_password": "x", "new_password": "novasenha1"}, headers=h)
        self.assertEqual(bad.status_code, 400)
        short = self.c.post("/api/auth/password", json={"current_password": "senha1234", "new_password": "123"}, headers=h)
        self.assertEqual(short.status_code, 400)
        ok = self.c.post("/api/auth/password", json={"current_password": "senha1234", "new_password": "novasenha1"}, headers=h)
        self.assertEqual(ok.status_code, 200)
        login = self.c.post("/api/auth/login", json={"email": "ana@exemplo.com", "password": "novasenha1"})
        self.assertEqual(login.status_code, 200)

    def test_register_validation_and_duplicate(self):
        r = self.c.post("/api/auth/register", json={"name": "A", "email": "x", "phone": "1", "password": "123"})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(set(r.get_json()["fields"]), {"name", "email", "phone", "password"})
        self.register()
        dup = self.c.post("/api/auth/register", json={"name": "Ana", "email": "Ana@Exemplo.com",
                                                      "phone": "21999991234", "password": "senha1234"})
        self.assertEqual(dup.status_code, 409)

    def test_password_is_hashed(self):
        self.register()
        with self.app.app_context():
            h = get_db().execute("SELECT password_hash FROM users").fetchone()[0]
        self.assertNotIn("senha1234", h)

    # ---- catálogo
    def test_catalog(self):
        products = self.c.get("/api/products").get_json()["products"]
        self.assertEqual(len(products), 33)  # Páscoa 2026 fica inativa
        self.assertFalse(any(p["category"] == "Páscoa" for p in products))
        cats = self.c.get("/api/categories").get_json()["categories"]
        self.assertIn("kits-festa", [c["slug"] for c in cats])
        self.assertEqual(self.c.get("/api/products/pascoa-pave-p").status_code, 404)

    # ---- validação do pedido
    def test_order_requires_login(self):
        self.assertEqual(self.c.post("/api/orders", json={}).status_code, 401)

    def test_order_rules(self):
        h = self.auth(self.register())
        post = lambda body: self.c.post("/api/orders", json=body, headers=h)

        self.assertIn("mínima", post(self.order_body([self.docinho(10)])).get_json()["error"])
        self.assertIn("inválida", post(self.order_body([self.docinho(25, "Sabor falso")])).get_json()["error"])
        p = self.product("docinhos-gourmet")
        self.assertIn("escolha", post(self.order_body([{"product_id": p["id"], "quantity": 25}])).get_json()["error"])
        bolo = self.product("bolo-decorado")
        self.assertIn("sob consulta", post(self.order_body(
            [{"product_id": bolo["id"], "quantity": 1, "selections": {}}])).get_json()["error"])
        self.assertIn("antecedência", post(self.order_body([self.docinho()], delivery_date=today_brt().isoformat())).get_json()["error"])
        self.assertIn("endereço", post(self.order_body([self.docinho()], fulfillment="delivery")).get_json()["error"])
        self.assertEqual(post(self.order_body([self.docinho()], payment_method="boleto")).status_code, 400)
        with self.app.app_context():
            pid = get_db().execute("SELECT id FROM products WHERE slug='pascoa-pave-p'").fetchone()[0]
        self.assertIn("disponível", post(self.order_body(
            [{"product_id": pid, "quantity": 1, "selections": {"sabor": "Torta de limão"}}])).get_json()["error"])

    def test_client_cannot_set_price(self):
        h = self.auth(self.register())
        item = self.docinho()
        item["unit_price_cents"] = 1
        o = self.c.post("/api/orders", json=self.order_body([item]), headers=h).get_json()["order"]
        self.assertEqual(o["subtotal_cents"], 25 * 275)

    # ---- pix
    def test_pix_order(self):
        h = self.auth(self.register())
        r = self.c.post("/api/orders", json=self.order_body([self.docinho()]), headers=h)
        self.assertEqual(r.status_code, 201, r.get_json())
        o = r.get_json()["order"]
        self.assertEqual(o["subtotal_cents"], 6875)
        self.assertEqual(o["due_now_cents"], 3438)  # 50% arredondado para cima
        self.assertEqual(o["remaining_cents"], 6875 - 3438)
        payload = o["payment"]["pix_payload"]
        self.assertIn("34.38", payload)
        self.assertIn("br.gov.bcb.pix", payload)
        self.assertEqual(payload[-4:], crc16(payload[:-4]))

    def test_kit_deposit_and_notes(self):
        h = self.auth(self.register())
        kit = self.product("kit-festa-1")
        sel = {"massa": "Chocolate", "recheio_bolo": ["Brigadeiro", "Oreo"], "recheio_cupcake": "Coco",
               "docinhos": ["Brigadeiro", "Beijinho"], "tema": "Pooh"}
        r = self.c.post("/api/orders", json=self.order_body([{"product_id": kit["id"], "quantity": 1,
                                                              "selections": sel}], notes="Sem castanhas"), headers=h)
        o = r.get_json()["order"]
        self.assertEqual((o["subtotal_cents"], o["due_now_cents"]), (35500, 17750))
        self.assertTrue(o["needs_review"])
        sel["recheio_bolo"] = ["Brigadeiro", "Oreo", "Coco"]  # passou do limite de 2
        bad = self.c.post("/api/orders", json=self.order_body([{"product_id": kit["id"], "quantity": 1,
                                                                "selections": sel}]), headers=h)
        self.assertEqual(bad.status_code, 400)

    def test_orders_are_private(self):
        h1, h2 = self.auth(self.register()), self.auth(self.register("bia@exemplo.com"))
        oid = self.c.post("/api/orders", json=self.order_body([self.docinho()]), headers=h1).get_json()["order"]["id"]
        self.assertEqual(self.c.get(f"/api/orders/{oid}", headers=h1).status_code, 200)
        self.assertEqual(self.c.get(f"/api/orders/{oid}", headers=h2).status_code, 404)
        self.assertEqual(len(self.c.get("/api/orders", headers=h2).get_json()["orders"]), 0)

    # ---- cartão / webhook
    def test_card_fee_and_webhook(self):
        h = self.auth(self.register())
        fake = {"id": "pref-1", "url": "https://mp.test/checkout"}
        with mock.patch("services.mercadopago.create_preference", return_value=fake) as cp:
            r = self.c.post("/api/orders", json=self.order_body([self.docinho()], payment_method="card_credit"),
                            headers=h)
        o = r.get_json()["order"]
        self.assertEqual(o["card_fee_cents"], 241)  # 7% de 34,38
        self.assertEqual(o["charge_cents"], 3438 + 241)
        self.assertEqual(o["payment"]["checkout_url"], fake["url"])
        self.assertEqual(cp.call_args[0][2], 3679)

        def hook(payment):
            with mock.patch("services.mercadopago.get_payment", return_value=payment):
                return self.c.post("/api/payments/mercadopago/webhook?type=payment&data.id=99", json={})

        base = {"id": 99, "external_reference": str(o["id"]), "currency_id": "BRL"}
        hook({**base, "status": "approved", "transaction_amount": 10.0})       # valor menor: ignora
        self.assertEqual(self.status(h, o["id"]), "pending_payment")
        hook({**base, "status": "pending", "transaction_amount": 36.79})       # não aprovado: ignora
        self.assertEqual(self.status(h, o["id"]), "pending_payment")
        self.assertEqual(hook({**base, "status": "approved", "transaction_amount": 36.79}).status_code, 200)
        self.assertEqual(self.status(h, o["id"]), "confirmed")
        self.assertEqual(self.c.get(f"/api/orders/{o['id']}", headers=h).get_json()["order"]["paid_cents"], 3679)

    def test_card_failure_keeps_order_and_allows_pix(self):
        from services.mercadopago import MercadoPagoError
        h = self.auth(self.register())
        with mock.patch("services.mercadopago.create_preference", side_effect=MercadoPagoError("x")):
            r = self.c.post("/api/orders", json=self.order_body([self.docinho()], payment_method="card_debit"), headers=h)
        self.assertEqual(r.status_code, 201)
        self.assertIsNotNone(r.get_json()["payment_error"])
        oid = r.get_json()["order"]["id"]
        r2 = self.c.post(f"/api/orders/{oid}/payment", json={"payment_method": "pix"}, headers=h).get_json()
        self.assertEqual(r2["order"]["card_fee_cents"], 0)
        self.assertIn("pix_payload", r2["order"]["payment"])

    def status(self, h, oid):
        return self.c.get(f"/api/orders/{oid}", headers=h).get_json()["order"]["status"]

    # ---- admin
    def test_admin_flow(self):
        token = self.register()
        h = self.auth(token)
        oid = self.c.post("/api/orders", json=self.order_body([self.docinho()]), headers=h).get_json()["order"]["id"]
        self.assertEqual(self.c.get("/api/admin/orders", headers=h).status_code, 403)
        with self.app.app_context():
            get_db().execute("UPDATE users SET is_admin = 1"); get_db().commit()
        self.assertEqual(len(self.c.get("/api/admin/orders", headers=h).get_json()["orders"]), 1)
        r = self.c.post(f"/api/admin/orders/{oid}/confirm-payment", json={}, headers=h).get_json()["order"]
        self.assertEqual((r["status"], r["paid_cents"]), ("confirmed", 3438))
        self.assertEqual(self.c.post(f"/api/admin/orders/{oid}/confirm-payment", json={}, headers=h).status_code, 409)
        self.assertEqual(self.c.patch(f"/api/admin/orders/{oid}", json={"status": "in_production"},
                                      headers=h).get_json()["order"]["status"], "in_production")
        self.assertEqual(self.c.patch(f"/api/admin/orders/{oid}", json={"status": "xyz"}, headers=h).status_code, 400)
        # reativar Páscoa
        pid = self.c.get("/api/admin/products", headers=h).get_json()["products"][-1]["id"]
        self.c.patch(f"/api/admin/products/{pid}", json={"active": True}, headers=h)
        self.assertEqual(len(self.c.get("/api/products").get_json()["products"]), 34)

    def test_whatsapp_order_and_notification(self):
        from urllib.parse import unquote
        h = self.auth(self.register())
        self.app.config.update(WA_CLOUD_TOKEN="tok", WA_PHONE_NUMBER_ID="123", WA_NOTIFY_TO="5521996911177")
        with mock.patch("services.whatsapp.requests.post") as post:
            post.return_value.status_code = 200
            r = self.c.post("/api/orders", json=self.order_body([self.docinho()], payment_method="whatsapp"), headers=h)
        self.assertEqual(r.status_code, 201, r.get_json())
        o = r.get_json()["order"]
        url = o["payment"]["whatsapp_url"]
        self.assertTrue(url.startswith("https://wa.me/5521996911177?text="))
        text = unquote(url.split("text=", 1)[1])
        for piece in (f"#{o['id']}", "25x Docinhos gourmet", "Sabor: Oreo", "R$ 68,75", "R$ 34,38", "Ana Souza"):
            self.assertIn(piece, text)
        self.assertEqual(o["card_fee_cents"], 0)
        self.assertIn("graph.facebook.com", post.call_args[0][0])
        self.assertIn(f"Novo pedido #{o['id']}", post.call_args[1]["data"])
        # padrão agora é WhatsApp
        d = self.order_body([self.docinho()]); d.pop("payment_method")
        self.assertEqual(self.c.post("/api/orders", json=d, headers=h).get_json()["order"]["payment_method"], "whatsapp")

    def test_long_cart_message_is_truncated(self):
        from urllib.parse import unquote
        h = self.auth(self.register())
        items = [self.docinho(25, s) for s in ("Churros", "Oreo", "Coco", "Paçoca", "Limão Siciliano", "Romeu e Julieta", "M&M")]
        items += [{"product_id": self.product("brigadeiros-premium")["id"], "quantity": 25, "selections": {"sabor": s}}
                  for s in ("Kinder", "Pistache", "KitKat", "Prestígio", "Confete", "Nozes", "Capuccino")]
        o = self.c.post("/api/orders", json=self.order_body(items, notes="x" * 400, payment_method="whatsapp"), headers=h).get_json()["order"]
        self.assertLess(len(unquote(o["payment"]["whatsapp_url"])), 1800)

    def test_contact(self):
        body = {"name": "Bia", "email": "bia@exemplo.com", "phone": "(21) 98888-7777", "subject": "Encomenda",
                "message": "Quero um bolo para sábado"}
        r = self.c.post("/api/contact", json=body)
        self.assertEqual(r.status_code, 201, r.get_json())
        self.assertIn("wa.me/5521996911177", r.get_json()["whatsapp_url"])
        bad = self.c.post("/api/contact", json={**body, "subject": "Spam", "email": "x"})
        self.assertEqual(set(bad.get_json()["fields"]), {"subject", "email"})
        with self.app.app_context():
            self.assertEqual(get_db().execute("SELECT COUNT(*) FROM contacts").fetchone()[0], 1)

    def test_cors(self):
        r = self.c.get("/api/health", headers={"Origin": "http://localhost:3000"})
        self.assertEqual(r.headers.get("Access-Control-Allow-Origin"), "http://localhost:3000")
        r = self.c.get("/api/health", headers={"Origin": "http://evil.example"})
        self.assertIsNone(r.headers.get("Access-Control-Allow-Origin"))


if __name__ == "__main__":
    unittest.main()
