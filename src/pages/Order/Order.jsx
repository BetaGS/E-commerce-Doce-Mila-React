// src/pages/Order/Order.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import './Order.css';
import { api } from '../../services/api';
import { formatBRL, formatDate, selectionsText, STATUS_LABELS, METHOD_LABELS, buildWhatsAppLink } from '../../utils/format';

const Order = ({ config }) => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.paymentError || '');
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (sync = false) => {
    try {
      const { order: o } = sync ? await api.syncOrder(id) : await api.getOrder(id);
      setOrder(o);
    } catch (e) { setError(e.message); }
  }, [id]);

  useEffect(() => { load(true); }, [load]);

  // Enquanto aguarda pagamento, confere de tempos em tempos
  useEffect(() => {
    if (order?.status !== 'pending_payment') return undefined;
    const timer = setInterval(() => load(order.payment_method.startsWith('card')), 10000);
    return () => clearInterval(timer);
  }, [order?.status, order?.payment_method, load]);

  const payload = order?.payment?.pix_payload;
  useEffect(() => {
    if (payload) QRCode.toDataURL(payload, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [payload]);

  const switchMethod = async (method) => {
    setMessage('');
    try {
      const { order: o, payment_error } = await api.changePayment(id, method);
      setOrder(o);
      setMessage(payment_error || '');
    } catch (e) { setMessage(e.message); }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(payload); setCopied(true); setTimeout(() => setCopied(false), 2500); }
    catch { setMessage('Não foi possível copiar. Selecione o código e copie manualmente.'); }
  };

  if (error) return <div className="od-page"><div className="container"><p className="od-error">{error}</p></div></div>;
  if (!order) return <div className="od-page"><div className="container"><p>Carregando pedido...</p></div></div>;

  const pending = order.status === 'pending_payment';
  const wa = (text) => buildWhatsAppLink(config?.whatsapp_number || '5521996911177', text);

  return (
    <div className="od-page">
      <div className="container od-wrap">
        <h1 className="od-title">Pedido #{order.id}</h1>
        <span className={`od-status s-${order.status}`}>{STATUS_LABELS[order.status]}</span>

        {message && <p className="od-error" role="alert">{message}</p>}

        {pending && (
          <section className="od-card">
            <h2>{order.payment_method === 'whatsapp'
              ? 'Falta só um passo: envie o pedido pelo WhatsApp'
              : `Pagamento: ${formatBRL(order.charge_cents)}`}</h2>

            {order.payment_method === 'whatsapp' && order.payment?.whatsapp_url && (
              <>
                <p>
                  Clique no botão para abrir o WhatsApp com o seu pedido já escrito e envie para a Doce Mila.
                  O pagamento do sinal ({formatBRL(order.due_now_cents)}) é combinado por lá.
                </p>
                <a className="btn od-whatsapp" href={order.payment.whatsapp_url} target="_blank" rel="noopener noreferrer">
                  Enviar pedido pelo WhatsApp
                </a>
                <p className="od-hint">Seu pedido #{order.id} já está salvo. Se fechar esta página, ele fica em “Meus pedidos” no seu perfil.</p>
              </>
            )}

            {order.payment_method === 'pix' && order.payment?.pix_payload && (
              <>
                <p>Abra o app do seu banco, escolha Pix e leia o QR Code ou use o Pix Copia e Cola.</p>
                {qr && <img className="od-qr" src={qr} alt="QR Code do Pix" />}
                <textarea className="od-code" readOnly value={payload} rows="4" onFocus={(e) => e.target.select()} />
                <button className="btn" onClick={copy}>{copied ? 'Copiado!' : 'Copiar código Pix'}</button>
                <p className="od-hint">
                  Conferimos os pagamentos manualmente, então a confirmação pode levar um tempo.
                  Se quiser agilizar,{' '}
                  <a href={wa(`Olá! Paguei o pedido #${order.id} (${formatBRL(order.charge_cents)}) via Pix. Segue o comprovante.`)}
                    target="_blank" rel="noopener noreferrer">envie o comprovante pelo WhatsApp</a>.
                </p>
              </>
            )}

            {order.payment_method.startsWith('card') && (
              order.payment?.checkout_url
                ? <>
                    <p>Você será levado ao ambiente seguro do Mercado Pago para pagar no {METHOD_LABELS[order.payment_method].toLowerCase()}.</p>
                    <a className="btn" href={order.payment.checkout_url}>Pagar com cartão</a>
                  </>
                : <p>O link de pagamento não foi gerado. Tente de novo abaixo.</p>
            )}

            <div className="od-switch">
              <span>Prefere outra forma?</span>
              {['whatsapp', 'pix', 'card_debit', 'card_credit']
                .filter((m) => m !== order.payment_method && (m === 'whatsapp' || (m === 'pix' ? config?.pix_enabled : config?.card_enabled)))
                .map((m) => <button key={m} className="btn btn-secondary" onClick={() => switchMethod(m)}>{METHOD_LABELS[m]}</button>)}
              {order.payment_method.startsWith('card') && !order.payment?.checkout_url &&
                <button className="btn" onClick={() => switchMethod(order.payment_method)}>Tentar de novo</button>}
            </div>
          </section>
        )}

        {!pending && order.status !== 'cancelled' && (
          <section className="od-card od-ok">
            <h2>Pagamento recebido: {formatBRL(order.paid_cents)}</h2>
            <p>Obrigada! Seu pedido está confirmado. Entraremos em contato pelo WhatsApp se precisarmos de algum detalhe.</p>
          </section>
        )}

        <section className="od-card">
          <h2>Itens</h2>
          <ul className="od-items">
            {order.items.map((i, idx) => (
              <li key={idx}>
                <div><strong>{i.quantity}× {i.name}</strong><small>{selectionsText(i.selections)}</small></div>
                <span>{formatBRL(i.line_total_cents)}</span>
              </li>
            ))}
          </ul>
          <div className="od-line"><span>Total do pedido</span><strong>{formatBRL(order.subtotal_cents)}</strong></div>
          {order.remaining_cents > 0 && <div className="od-line"><span>Restante a pagar depois</span><span>{formatBRL(order.remaining_cents)}</span></div>}
          {order.needs_review && <p className="od-hint">Valor final sujeito à decoração; confirmaremos pelo WhatsApp.</p>}
        </section>

        <section className="od-card">
          <h2>Entrega</h2>
          <p>{order.fulfillment === 'pickup' ? 'Retirada na Tijuca' : `Entrega: ${order.address}`}</p>
          <p>Data: {formatDate(order.delivery_date)} {order.delivery_time && `· ${order.delivery_time}`}</p>
          {order.notes && <p>Observações: {order.notes}</p>}
        </section>

        <Link to="/perfil?aba=pedidos" className="od-back">Ver todos os meus pedidos</Link>
      </div>
    </div>
  );
};

export default Order;
