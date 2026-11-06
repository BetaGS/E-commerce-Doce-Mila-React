// src/pages/MyOrders/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Order/Order.css';
import { api } from '../../services/api';
import { formatBRL, formatDate, STATUS_LABELS } from '../../utils/format';

const MyOrders = () => {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myOrders().then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="od-page">
      <div className="container od-wrap">
        <h1 className="od-title">Meus pedidos</h1>
        {error && <p className="od-error">{error}</p>}
        {orders === null && !error && <p>Carregando...</p>}
        {orders?.length === 0 && <p>Você ainda não fez pedidos. <Link to="/produtos" className="od-back">Ver produtos</Link></p>}
        {orders?.map((o) => (
          <Link key={o.id} to={`/pedido/${o.id}`} className="od-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="od-line"><strong>Pedido #{o.id}</strong><span className={`od-status s-${o.status}`}>{STATUS_LABELS[o.status]}</span></div>
            <div className="od-line"><span>Data: {formatDate(o.delivery_date)}</span><strong>{formatBRL(o.subtotal_cents)}</strong></div>
            <small>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</small>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
