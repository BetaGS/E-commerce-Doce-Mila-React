# E-commerce Doce Mila - Back-End (Flask + Gunicorn)

## Configuração no Render (Deploy)

- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`

## Ajustes Realizados
1. Adicionada a rota raiz `/` para responder com `200 OK` na verificação de saúde (*health check*) do Render.
2. Adicionado o `gunicorn` para servir a aplicação em ambiente de produção (eliminando o aviso do servidor de desenvolvimento do Werkzeug/Flask).
3. Configuração do `host='0.0.0.0'` e porta dinâmica via `os.environ.get("PORT")`.
