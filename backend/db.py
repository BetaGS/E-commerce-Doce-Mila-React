"""Acesso ao banco. SQLite por padrão (desenvolvimento); PostgreSQL quando DATABASE_URL existe (produção).

O resto do código usa só: db.execute(sql, params) com marcadores "?", db.executemany, db.commit,
row["coluna"], row[0] e cursor.lastrowid, que funcionam igual nos dois bancos.
"""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from flask import current_app, g

SCHEMA_SQLITE = Path(__file__).with_name("schema.sql")
SCHEMA_PG = Path(__file__).with_name("schema_pg.sql")

try:  # o driver do PostgreSQL só é necessário em produção
    import psycopg
    INTEGRITY_ERRORS = (sqlite3.IntegrityError, psycopg.IntegrityError)
except ImportError:  # pragma: no cover
    psycopg = None
    INTEGRITY_ERRORS = (sqlite3.IntegrityError,)


def now_utc():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


class Row(dict):
    """Linha que aceita row["coluna"] e row[0], como o sqlite3.Row."""

    def __getitem__(self, key):
        if isinstance(key, int):
            return list(self.values())[key]
        return super().__getitem__(key)


def _row_factory(cursor):
    names = [c.name for c in cursor.description] if cursor.description else []
    return lambda values: Row(zip(names, values))


class Result:
    def __init__(self, cursor, lastrowid=None):
        self._cursor, self.lastrowid = cursor, lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()


class PgDb:
    """Adaptador fino sobre uma conexão psycopg para imitar a API do sqlite3 usada no projeto."""

    def __init__(self, conn):
        self.conn = conn

    def execute(self, sql, params=()):
        sql = sql.replace("?", "%s")
        wants_id = sql.lstrip().upper().startswith("INSERT") and "RETURNING" not in sql.upper()
        if wants_id:
            sql += " RETURNING id"
        cursor = self.conn.cursor()
        cursor.execute(sql, params)
        return Result(cursor, cursor.fetchone()["id"] if wants_id else None)

    def executemany(self, sql, seq):
        cursor = self.conn.cursor()
        cursor.executemany(sql.replace("?", "%s"), seq)
        return Result(cursor)

    def executescript(self, script):
        for statement in script.split(";"):
            if statement.strip():
                self.conn.cursor().execute(statement)

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        self.conn.close()


def get_db():
    if "db" not in g:
        url = current_app.config.get("DATABASE_URL")
        if url:
            if psycopg is None:
                raise RuntimeError("DATABASE_URL definido, mas o pacote psycopg não está instalado.")
            g.db = PgDb(psycopg.connect(url, row_factory=_row_factory))
        else:
            path = Path(current_app.config["DATABASE_PATH"])
            path.parent.mkdir(parents=True, exist_ok=True)
            conn = sqlite3.connect(path, timeout=10)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON")
            conn.execute("PRAGMA journal_mode = WAL")
            g.db = conn
    return g.db


def close_db(_exc=None):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def init_db():
    db = get_db()
    schema = SCHEMA_PG if current_app.config.get("DATABASE_URL") else SCHEMA_SQLITE
    db.executescript(schema.read_text(encoding="utf-8"))
    db.commit()


def loads(value, default):
    try:
        return json.loads(value) if value else default
    except (TypeError, ValueError):
        return default
