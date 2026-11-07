"""Roda TODA a suíte de testes da API passando pelo adaptador PostgreSQL (PgDb).

Não há PostgreSQL neste ambiente, então um "psycopg falso" repassa os comandos para um SQLite temporário
(trocando %s por ?). Isso valida o adaptador (marcadores, RETURNING id, linhas com row[0]/row["x"], erros de
integridade) com as consultas reais do projeto. O SQL específico do PostgreSQL (schema_pg.sql) NÃO é
exercitado aqui; ele precisa ser conferido em um PostgreSQL de verdade.
"""
import os
import sqlite3
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db as db_module  # noqa: E402
import test_api  # noqa: E402


class _Col:
    def __init__(self, name):
        self.name = name


class _FakeCursor:
    def __init__(self, conn, row_factory):
        self._c, self._rf, self.description, self.rowcount, self._maker = conn.cursor(), row_factory, None, -1, None

    def _after(self):
        self.rowcount = self._c.rowcount
        self.description = [_Col(d[0]) for d in self._c.description] if self._c.description else None
        self._maker = self._rf(self) if self.description else None

    def execute(self, sql, params=()):
        assert "?" not in sql, f"marcador ? não convertido: {sql}"
        self._c.execute(sql.replace("%s", "?"), params)
        self._after()

    def executemany(self, sql, seq):
        assert "?" not in sql
        self._c.executemany(sql.replace("%s", "?"), seq)
        self._after()

    def fetchone(self):
        row = self._c.fetchone()
        return None if row is None else self._maker(row)

    def fetchall(self):
        return [self._maker(r) for r in self._c.fetchall()]


class _FakeConn:
    def __init__(self, path, row_factory):
        self._conn, self._rf = sqlite3.connect(path), row_factory
        self._conn.execute("PRAGMA foreign_keys = ON")

    def cursor(self):
        return _FakeCursor(self._conn, self._rf)

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


class _FakePsycopg:
    IntegrityError = sqlite3.IntegrityError

    def __init__(self):
        self.path = None

    def connect(self, url, row_factory):
        return _FakeConn(self.path, row_factory)


class PgAdapterApiTest(test_api.ApiTest):
    """Mesmos testes da API, agora via PgDb."""

    def setUp(self):
        fake = _FakePsycopg()
        patcher = mock.patch.object(db_module, "psycopg", fake)
        patcher.start()
        self.addCleanup(patcher.stop)
        schema = mock.patch.object(db_module, "SCHEMA_PG", db_module.SCHEMA_SQLITE)  # só o schema muda
        schema.start()
        self.addCleanup(schema.stop)
        import tempfile
        fake.path = os.path.join(tempfile.mkdtemp(), "pg-shim.db")
        original = test_api.create_app

        def create(overrides):
            overrides = {**overrides, "DATABASE_URL": "postgresql://fake/fake"}
            return original(overrides)

        with mock.patch.object(test_api, "create_app", create):
            super().setUp()
        self.assertIsInstance(self._db_type(), db_module.PgDb)

    def _db_type(self):
        with self.app.app_context():
            return db_module.get_db()


class PgDbUnitTest(unittest.TestCase):
    def test_translation_and_returning(self):
        calls = []

        class Cur:
            def execute(self, sql, params=()):
                calls.append(sql)

            def executemany(self, sql, seq):
                calls.append(sql)

            def fetchone(self):
                return db_module.Row({"id": 7})

        class Conn:
            def cursor(self):
                return Cur()

        pg = db_module.PgDb(Conn())
        self.assertEqual(pg.execute("INSERT INTO users (a) VALUES (?)", (1,)).lastrowid, 7)
        self.assertEqual(calls[-1], "INSERT INTO users (a) VALUES (%s) RETURNING id")
        pg.execute("UPDATE users SET a = ? WHERE id = ?", (1, 2))
        self.assertEqual(calls[-1], "UPDATE users SET a = %s WHERE id = %s")
        pg.executemany("INSERT INTO t (a) VALUES (?)", [(1,), (2,)])
        self.assertNotIn("RETURNING", calls[-1])
        row = db_module.Row({"count": 5, "x": "y"})
        self.assertEqual((row[0], row["count"], row["x"]), (5, 5, "y"))


if __name__ == "__main__":
    unittest.main()
