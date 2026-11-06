import json

from catalog_data import PRODUCTS


def seed_products(db, reset=False):
    """Insere/atualiza o catálogo. Com reset=True, apaga produtos sem pedidos antes."""
    if reset:
        db.execute("DELETE FROM products WHERE id NOT IN (SELECT product_id FROM order_items)")
    for order, p in enumerate(PRODUCTS):
        values = (
            p["slug"], p["name"], p["category"], p["description"], p["notes"], p["image"],
            json.dumps(p["gallery"]), p["price_cents"], p["price_note"], int(p["price_from"]),
            int(p["variable_price"]), p["min_qty"], p["deposit_percent"], json.dumps(p["options"], ensure_ascii=False),
            int(p["active"]), int(p["is_new"]), order, p["availability_note"],
        )
        db.execute(
            """INSERT INTO products (slug,name,category,description,notes,image,gallery_json,price_cents,
                 price_note,price_from,variable_price,min_qty,deposit_percent,options_json,active,is_new,
                 sort_order,availability_note)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(slug) DO UPDATE SET
                 name=excluded.name, category=excluded.category, description=excluded.description,
                 notes=excluded.notes, image=excluded.image, gallery_json=excluded.gallery_json,
                 price_cents=excluded.price_cents, price_note=excluded.price_note,
                 price_from=excluded.price_from, variable_price=excluded.variable_price,
                 min_qty=excluded.min_qty, deposit_percent=excluded.deposit_percent,
                 options_json=excluded.options_json, sort_order=excluded.sort_order,
                 availability_note=excluded.availability_note""",
            values,
        )
    db.commit()
    return len(PRODUCTS)
