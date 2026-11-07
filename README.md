# Doce Mila — e-commerce

Front-end React + Vite (`src/`) e back-end Python/Flask (`backend/`) com banco SQLite.

## Rodar localmente

```bash
# 1) Back-end (porta 5000)
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # preencha SECRET_KEY e PIX_KEY
python manage.py seed           # carrega o catálogo dos cardápios
python app.py

# 2) Front-end (porta 3000, em outro terminal, na raiz do projeto)
npm install
npm run dev
```

O Vite encaminha `/api` para o Flask, então não há configuração extra em desenvolvimento.

## Painel da confeiteira
**Em produção (Render):**
1. No Web Service, crie `ADMIN_SETUP_KEY` com um código aleatório de 32+ caracteres (botão *Generate*) e aguarde o redeploy.
2. Cadastre-se e entre no site normalmente.
3. Em `/perfil`, no fim da aba "Meu perfil", abra "Sou administrador(a) da loja", digite o código e clique em "Ativar acesso".
4. Depois pode apagar `ADMIN_SETUP_KEY` do Render para desativar a ativação.

**Local:** `python manage.py make-admin seu@email.com`

Depois acesse `/admin` para confirmar Pix recebidos e mudar o status dos pedidos.

## Banco de dados em produção (para não perder cadastros)
O SQLite grava num arquivo do servidor, e no Render gratuito esse disco é apagado a cada reinício/deploy (por isso
os cadastros sumiam). Em produção use um PostgreSQL externo:
1. Crie um banco gratuito (ex.: [Neon](https://neon.tech)) e copie a *connection string* (`postgresql://...?sslmode=require`).
2. No Web Service do Render, em Environment, crie `DATABASE_URL` com ela e salve (o Render refaz o deploy).
3. Abra `/api/products`: o catálogo é criado sozinho. Cadastre-se de novo (os dados do SQLite antigo não migram)
   e refaça a ativação de administrador.

Sem `DATABASE_URL` o projeto usa SQLite (bom para desenvolvimento local). Confira as condições atuais do plano gratuito
do provedor escolhido.

## WhatsApp
- **Finalizar pedido (padrão):** o pedido é salvo no banco e o cliente abre o WhatsApp com a mensagem pronta
  (link oficial `wa.me`, número em `WHATSAPP_NUMBER`). O pagamento é combinado na conversa; depois a confeitaria
  confirma o sinal em `/admin`.
- **Contato:** o formulário salva a mensagem (tabela `contacts`) e também abre o WhatsApp com o texto pronto.
- **Aviso automático para a confeitaria (opcional, WhatsApp Business Cloud API):** preencha `WA_CLOUD_TOKEN`,
  `WA_PHONE_NUMBER_ID` e `WA_NOTIFY_TO` no `.env`. Precisa de conta Meta Business e de um número registrado na
  Cloud API (diferente do número que fica no aplicativo). Para mensagens fora da janela de 24h, crie na Meta um
  template com 2 variáveis (`{{1}}` título, `{{2}}` resumo) e informe o nome em `WA_TEMPLATE_NAME`.

## Pagamentos online (opcionais)
Pix e cartão só aparecem no checkout se `PIX_KEY` / `MP_ACCESS_TOKEN` estiverem preenchidos.

- **Pix**: gera Pix Copia e Cola/QR Code com a `PIX_KEY`. A confirmação é manual no `/admin`.
- **Cartão (débito/crédito)**: Mercado Pago Checkout Pro (`MP_ACCESS_TOKEN`), confirmação automática por webhook.
  O webhook precisa de uma URL pública HTTPS (`API_PUBLIC_URL`).
- Sinal de 50% nas encomendas; Páscoa exige pagamento integral. Taxas de 5% (débito) e 7% (crédito) vêm do cardápio.

## Catálogo
Os produtos ficam em `backend/catalog_data.py` (valores em centavos). Edite e rode `python manage.py seed`.
Os itens da Páscoa 2026 estão inativos; reative-os em `/api/admin/products/<id>` (PATCH `{"active": true}`).

## Testes do back-end
`cd backend && python -m unittest discover -s tests -v`
