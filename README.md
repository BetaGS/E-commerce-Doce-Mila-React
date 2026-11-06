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
1. Cadastre-se no site normalmente.
2. `python manage.py make-admin seu@email.com`
3. Acesse `/admin` para confirmar Pix recebidos e mudar o status dos pedidos.

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
