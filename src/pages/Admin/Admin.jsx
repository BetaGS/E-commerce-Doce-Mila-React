// src/pages/Admin/Admin.jsx  (painel da confeiteira)
import React, { useCallback, useEffect, useState } from 'react';
import './Admin.css';
import { api } from '../../services/api';
import { formatBRL, formatDate, selectionsText, STATUS_LABELS, METHOD_LABELS } from '../../utils/format';

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.adminOrders(filter).then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const replace = (o) => setOrders((list) => list.map((x) => (x.id === o.id ? o : x)));

  const confirm = async (o) => {
    if (!window.confirm(`Confirmar que recebeu ${formatBRL(o.charge_cents)} do pedido #${o.id}?`)) return;
    try { replace((await api.adminConfirmPayment(o.id)).order); } catch (e) { setError(e.message); }
  };

  const setStatus = async (o, status) => {
    try { replace((await api.adminSetStatus(o.id, status)).order); } catch (e) { setError(e.message); }
  };

  return (
    <div className="adm-page"><div className="container">
      <h1 className="adm-title">Pedidos</h1>
      <div className="adm-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn" onClick={load}>Atualizar</button>
      </div>
      {error && <p className="adm-error">{error}</p>}
      {orders.length === 0 && <p>Nenhum pedido.</p>}
      {orders.map((o) => (
        <article key={o.id} className="adm-card">
          <header>
            <strong>#{o.id} · {o.customer_name}</strong>
            <span>{o.customer_phone} · {o.customer_email}</span>
          </header>
          <p>Para {formatDate(o.delivery_date)} {o.delivery_time} · {o.fulfillment === 'pickup' ? 'Retirada' : `Entrega: ${o.address}`}</p>
          <ul>
            {o.items.map((i, idx) => <li key={idx}>{i.quantity}× {i.name} <small>{selectionsText(i.selections)}</small></li>)}
          </ul>
          {o.notes && <p><em>Obs.: {o.notes}</em></p>}
          <p>Total {formatBRL(o.subtotal_cents)} · cobrado agora {formatBRL(o.charge_cents)} ({METHOD_LABELS[o.payment_method]})
            {o.needs_review && ' · valor sujeito à decoração'}</p>
          <footer>
            {o.status === 'pending_payment'
              ? <button className="btn" onClick={() => confirm(o)}>Confirmar pagamento recebido</button>
              : <span>Pago: {formatBRL(o.paid_cents)}</span>}
            <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </footer>
        </article>
      ))}
    </div></div>
  );
};

export default Admin;
