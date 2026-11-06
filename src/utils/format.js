// src/utils/format.js
export const formatBRL = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

export const STATUS_LABELS = {
  pending_payment: 'Aguardando pagamento',
  confirmed: 'Pedido confirmado',
  in_production: 'Em produção',
  ready: 'Pronto',
  completed: 'Entregue',
  cancelled: 'Cancelado',
};

export const METHOD_LABELS = {
  whatsapp: 'WhatsApp',
  pix: 'Pix',
  card_debit: 'Cartão de débito',
  card_credit: 'Cartão de crédito',
};

// "Massa: Chocolate · Recheio: Brigadeiro, Oreo"
export const selectionsText = (selections = []) =>
  selections
    .map((s) => `${s.label}: ${Array.isArray(s.value) ? s.value.join(', ') : s.value}`)
    .join(' · ');

// Texto do preço exibido no card/detalhe
export const priceLabel = (product) => {
  if (product.price_note) return product.price_note; // ex.: "R$ 275,00 o cento", "a partir de R$ 13,50 a unidade"
  if (product.price_cents == null) return 'Sob consulta';
  return formatBRL(product.price_cents);
};

export const buildWhatsAppLink = (number, text) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

// Converte as escolhas do cliente ({massa: 'Chocolate', recheio: [...]}) em lista legível
export const labelSelections = (product, selections = {}) =>
  (product.options || [])
    .map((group) => ({ key: group.key, label: group.label, value: selections[group.key] }))
    .filter((s) => (Array.isArray(s.value) ? s.value.length > 0 : Boolean(s.value)));

// "21999991234" -> "(21) 99999-1234"
export const formatPhone = (value = '') => {
  const n = value.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n ? `(${n}` : '';
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
};
