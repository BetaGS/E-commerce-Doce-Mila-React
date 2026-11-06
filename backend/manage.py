"""Comandos de administração.

  python manage.py init-db              cria as tabelas
  python manage.py seed                 carrega/atualiza o catálogo (catalog_data.py)
  python manage.py make-admin EMAIL     dá acesso ao painel /admin para uma conta já cadastrada
"""
import sys

from app import create_app
from db import get_db, init_db
from seed import seed_products


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 1
    app = create_app()
    with app.app_context():
        cmd = argv[1]
        if cmd == "init-db":
            init_db()
            print("Banco criado.")
        elif cmd == "seed":
            init_db()
            print(f"{seed_products(get_db())} produtos carregados.")
        elif cmd == "make-admin" and len(argv) == 3:
            db = get_db()
            cur = db.execute("UPDATE users SET is_admin = 1 WHERE email = ?", (argv[2].strip().lower(),))
            db.commit()
            print("OK, admin criado." if cur.rowcount else "Nenhuma conta com esse e-mail. Cadastre-se no site primeiro.")
        else:
            print(__doc__)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
