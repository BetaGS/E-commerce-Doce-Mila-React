-- Mesmo modelo do schema.sql, em PostgreSQL. Valores em centavos (INTEGER).
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  phone         TEXT    NOT NULL,
  password_hash TEXT    NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  slug            TEXT    NOT NULL UNIQUE,
  name            TEXT    NOT NULL,
  category        TEXT    NOT NULL,
  description     TEXT    NOT NULL DEFAULT '',
  notes           TEXT    NOT NULL DEFAULT '',
  image           TEXT    NOT NULL DEFAULT '/images/Logo.jpg',
  gallery_json    TEXT    NOT NULL DEFAULT '[]',
  price_cents     INTEGER,
  price_note      TEXT    NOT NULL DEFAULT '',
  price_from      INTEGER NOT NULL DEFAULT 0,
  variable_price  INTEGER NOT NULL DEFAULT 0,
  min_qty         INTEGER NOT NULL DEFAULT 1,
  deposit_percent INTEGER NOT NULL DEFAULT 50,
  options_json    TEXT    NOT NULL DEFAULT '[]',
  active          INTEGER NOT NULL DEFAULT 1,
  is_new          INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  availability_note TEXT  NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  status           TEXT    NOT NULL DEFAULT 'pending_payment',
  customer_name    TEXT    NOT NULL,
  customer_phone   TEXT    NOT NULL,
  customer_email   TEXT    NOT NULL,
  fulfillment      TEXT    NOT NULL,
  delivery_date    TEXT    NOT NULL,
  delivery_time    TEXT    NOT NULL DEFAULT '',
  address          TEXT    NOT NULL DEFAULT '',
  notes            TEXT    NOT NULL DEFAULT '',
  needs_review     INTEGER NOT NULL DEFAULT 0,
  subtotal_cents   INTEGER NOT NULL,
  due_now_cents    INTEGER NOT NULL,
  payment_method   TEXT    NOT NULL DEFAULT 'pix',
  card_fee_cents   INTEGER NOT NULL DEFAULT 0,
  paid_cents       INTEGER NOT NULL DEFAULT 0,
  paid_at          TEXT,
  mp_preference_id TEXT,
  mp_checkout_url  TEXT,
  mp_payment_id    TEXT,
  created_at       TEXT    NOT NULL DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD HH24:MI:SS')
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER NOT NULL REFERENCES products(id),
  name             TEXT    NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity         INTEGER NOT NULL,
  deposit_percent  INTEGER NOT NULL,
  selections_json  TEXT    NOT NULL DEFAULT '[]',
  line_total_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD HH24:MI:SS')
);
