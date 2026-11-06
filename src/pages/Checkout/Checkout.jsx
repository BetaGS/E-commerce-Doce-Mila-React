// src/pages/Checkout/Checkout.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';
import { api } from '../../services/api';
import { formatBRL, selectionsText } from '../../utils/format';

const isoDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const Checkout = ({ cartItems, cartTotals, config, user, clearCart }) => {
  const navigate = useNavigate();
  const leadDays = config?.min_lead_days ?? 2;
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + leadDays);

  const methods = [
    {
      id: 'whatsapp', label: 'Combinar pelo WhatsApp',
      hint: 'Você envia o pedido para a confeitaria e combina o pagamento (sinal, Pix ou cartão) por lá.',
    },
    config?.pix_enabled && { id: 'pix', label: 'Pix', hint: 'Sem taxa. Confirmado após conferirmos o pagamento.' },
    config?.card_enabled && {
      id: 'card_debit', label: 'Cartão de débito',
      hint: `Acréscimo de ${config.card_fee_debit_percent}% sobre o valor pago agora.`,
    },
    config?.card_enabled && {
      id: 'card_credit', label: 'Cartão de crédito',
      hint: `Acréscimo de ${config.card_fee_credit_percent}% sobre o valor pago agora.`,
    },
  ].filter(Boolean);

  const [form, setForm] = useState({
    fulfillment: 'pickup', address: '', delivery_date: '', delivery_time: '', notes: '',
    payment_method: 'whatsapp',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => { setForm((f) => ({ ...f, [key]: value })); setError(''); };

  if (cartItems.length === 0) {
    return (
      <div className="ck-page"><div className="container ck-empty">
        <h2>Seu carrinho está vazio</h2>
        <Link to="/produtos" className="btn">Ver produtos</Link>
      </div></div>
    );
  }

  const method = methods.find((m) => m.id === form.payment_method);
  const feePct = { card_debit: config?.card_fee_debit_percent, card_credit: config?.card_fee_credit_percent }[form.payment_method] || 0;
  const fee = Math.round((cartTotals.dueNow * feePct) / 100);
  const hasDeposit = cartTotals.dueNow < cartTotals.subtotal;
  const needsReview = cartItems.some((i) => i.variable_price);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.delivery_date) return setError('Escolha a data do pedido.');
    if (form.fulfillment === 'delivery' && form.address.trim().length < 8) return setError('Informe o endereço completo.');
    if (!method) return setError('Nenhuma forma de pagamento disponível no momento. Fale conosco pelo WhatsApp.');

    setSubmitting(true);
    try {
      const { order, payment_error } = await api.createOrder({
        ...form,
        items: cartItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity, selections: i.selections })),
      });
      clearCart();
      navigate(`/pedido/${order.id}`, { state: { paymentError: payment_error }, replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ck-page">
      <div className="container">
        <h1 className="ck-title">Finalizar pedido</h1>
        <form className="ck-grid" onSubmit={submit}>
          <div className="ck-main">
            <section className="ck-card">
              <h2>Retirada ou entrega</h2>
              <div className="ck-options">
                <label className={`ck-option ${form.fulfillment === 'pickup' ? 'on' : ''}`}>
                  <input type="radio" name="f" checked={form.fulfillment === 'pickup'} onChange={() => set('fulfillment', 'pickup')} />
                  <strong>Retirar na Tijuca</strong>
                  <span>{config?.pickup_info}</span>
                </label>
                <label className={`ck-option ${form.fulfillment === 'delivery' ? 'on' : ''}`}>
                  <input type="radio" name="f" checked={form.fulfillment === 'delivery'} onChange={() => set('fulfillment', 'delivery')} />
                  <strong>Entrega</strong>
                  <span>O valor da entrega é combinado pelo WhatsApp e não está incluso aqui.</span>
                </label>
              </div>
              {form.fulfillment === 'delivery' && (
                <label className="ck-field">Endereço completo
                  <textarea rows="2" value={form.address} onChange={(e) => set('address', e.target.value)} maxLength={300} />
                </label>
              )}
              <div className="ck-row">
                <label className="ck-field">Data do pedido
                  <input type="date" min={isoDate(earliest)} value={form.delivery_date}
                    onChange={(e) => set('delivery_date', e.target.value)} required />
                  <small>Antecedência mínima de {leadDays} dias.</small>
                </label>
                <label className="ck-field">Horário desejado (opcional)
                  <input type="text" maxLength={40} placeholder="Ex.: 14h" value={form.delivery_time}
                    onChange={(e) => set('delivery_time', e.target.value)} />
                </label>
              </div>
              <label className="ck-field">Observações (opcional)
                <textarea rows="3" maxLength={500} value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  placeholder="Alergias, detalhes da decoração, referências..." />
              </label>
            </section>

            <section className="ck-card">
              <h2>Pagamento</h2>
              {methods.length === 0 && <p className="ck-error">Pagamento online indisponível no momento.</p>}
              <div className="ck-options">
                {methods.map((m) => (
                  <label key={m.id} className={`ck-option ${form.payment_method === m.id ? 'on' : ''}`}>
                    <input type="radio" name="p" checked={form.payment_method === m.id} onChange={() => set('payment_method', m.id)} />
                    <strong>{m.label}</strong><span>{m.hint}</span>
                  </label>
                ))}
              </div>
              <p className="ck-note">
                {hasDeposit
                  ? 'Pedidos são confirmados com o sinal de 50%. O restante é pago até 1 dia antes da entrega (Pix ou transferência) ou no dia (espécie ou cartão, com taxas).'
                  : 'Este pedido é confirmado com o pagamento integral.'}
              </p>
            </section>
          </div>

          <aside className="ck-card ck-summary">
            <h2>Resumo</h2>
            <ul className="ck-items">
              {cartItems.map((i) => (
                <li key={i.lineId}>
                  <div><strong>{i.quantity}× {i.name}</strong>
                    <small>{selectionsText(i.selectionsLabelled)}</small></div>
                  <span>{formatBRL(i.price_cents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="ck-line"><span>Subtotal</span><span>{formatBRL(cartTotals.subtotal)}</span></div>
            <div className="ck-line strong"><span>{hasDeposit ? 'Sinal (combinado no WhatsApp)' : 'Valor a combinar agora'}</span>
              <span>{formatBRL(cartTotals.dueNow + fee)}</span></div>
            {fee > 0 && <div className="ck-line small"><span>Inclui taxa do cartão</span><span>{formatBRL(fee)}</span></div>}
            {hasDeposit && <div className="ck-line small"><span>Restante</span><span>{formatBRL(cartTotals.subtotal - cartTotals.dueNow)}</span></div>}
            {needsReview && <p className="ck-note">Alguns itens têm valor sujeito à decoração. Confirmamos o valor final pelo WhatsApp.</p>}
            <p className="ck-note">Cliente: {user?.name}</p>
            {error && <p className="ck-error" role="alert">{error}</p>}
            <button className="btn ck-submit" disabled={submitting || methods.length === 0}>
              {submitting ? 'Enviando...' : form.payment_method === 'whatsapp' ? 'Finalizar pelo WhatsApp' : 'Confirmar e pagar'}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
