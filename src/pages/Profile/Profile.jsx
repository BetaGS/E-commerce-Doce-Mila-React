// src/pages/Profile/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Profile.css';
import { api } from '../../services/api';
import { formatBRL, formatDate, formatPhone, selectionsText, STATUS_LABELS } from '../../utils/format';

const TABS = [
  { id: 'perfil', label: 'Meu perfil' },
  { id: 'pedidos', label: 'Últimos pedidos' },
];

const Profile = ({ user, onUserUpdate, onLogout }) => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'pedidos' ? 'pedidos' : 'perfil';
  const changeTab = (id) => setParams(id === 'perfil' ? {} : { aba: id }, { replace: true });

  const [form, setForm] = useState({ name: user?.name || '', phone: formatPhone(user?.phone) });
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState('');
  useEffect(() => {
    if (tab !== 'pedidos') return;
    api.myOrders().then((d) => setOrders(d.orders)).catch((e) => setOrdersError(e.message));
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg({ type: '', text: '' });
    setFieldErrors({});
    try {
      const { user: fresh } = await api.updateProfile(form);
      onUserUpdate(fresh);
      setForm({ name: fresh.name, phone: formatPhone(fresh.phone) });
      setProfileMsg({ type: 'ok', text: 'Dados atualizados!' });
    } catch (err) {
      setFieldErrors(err.fields);
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    setPwErrors({});
    if (pw.new_password !== pw.confirm) {
      setPwErrors({ confirm: 'As senhas não coincidem.' });
      return;
    }
    setPwSaving(true);
    try {
      await api.changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      setPw({ current_password: '', new_password: '', confirm: '' });
      setPwMsg({ type: 'ok', text: 'Senha alterada com sucesso.' });
    } catch (err) {
      setPwErrors(err.fields);
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwSaving(false);
    }
  };

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="pf-page">
      <div className="container pf-wrap">
        <header className="pf-header">
          <div className="pf-avatar" aria-hidden="true">{initial}</div>
          <div>
            <h1 className="pf-title">{user?.name}</h1>
            <p className="pf-email">{user?.email}</p>
          </div>
        </header>

        <div className="pf-tabs" role="tablist" aria-label="Seções da conta">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`pf-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => changeTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'perfil' && (
          <div id="panel-perfil" role="tabpanel" aria-labelledby="tab-perfil" className="pf-panel">
            <section className="pf-card">
              <h2>Meus dados</h2>
              <form onSubmit={saveProfile} className="pf-form">
                <label className="pf-field">Nome completo
                  <input type="text" value={form.name} maxLength={80}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  {fieldErrors.name && <small className="pf-err">{fieldErrors.name}</small>}
                </label>
                <label className="pf-field">Telefone (WhatsApp)
                  <input type="tel" value={form.phone} maxLength={15} placeholder="(21) 99999-9999"
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} />
                  {fieldErrors.phone && <small className="pf-err">{fieldErrors.phone}</small>}
                </label>
                <label className="pf-field">E-mail
                  <input type="email" value={user?.email || ''} disabled />
                  <small>O e-mail é o seu login e não pode ser alterado aqui.</small>
                </label>
                {profileMsg.text && <p className={`pf-msg ${profileMsg.type}`} role="status">{profileMsg.text}</p>}
                <button className="btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
              </form>
            </section>

            <section className="pf-card">
              <h2>Alterar senha</h2>
              <form onSubmit={savePassword} className="pf-form">
                <label className="pf-field">Senha atual
                  <input type="password" autoComplete="current-password" value={pw.current_password}
                    onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
                  {pwErrors.current_password && <small className="pf-err">{pwErrors.current_password}</small>}
                </label>
                <label className="pf-field">Nova senha (mínimo de 8 caracteres)
                  <input type="password" autoComplete="new-password" value={pw.new_password}
                    onChange={(e) => setPw({ ...pw, new_password: e.target.value })} required />
                  {pwErrors.new_password && <small className="pf-err">{pwErrors.new_password}</small>}
                </label>
                <label className="pf-field">Confirmar nova senha
                  <input type="password" autoComplete="new-password" value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
                  {pwErrors.confirm && <small className="pf-err">{pwErrors.confirm}</small>}
                </label>
                {pwMsg.text && <p className={`pf-msg ${pwMsg.type}`} role="status">{pwMsg.text}</p>}
                <button className="btn" disabled={pwSaving}>{pwSaving ? 'Salvando...' : 'Alterar senha'}</button>
              </form>
            </section>

            <Link to="/" className="pf-logout" onClick={onLogout}>Sair da conta</Link>
          </div>
        )}

        {tab === 'pedidos' && (
          <div id="panel-pedidos" role="tabpanel" aria-labelledby="tab-pedidos" className="pf-panel">
            {ordersError && <p className="pf-msg error">{ordersError}</p>}
            {orders === null && !ordersError && <p>Carregando...</p>}
            {orders?.length === 0 && (
              <section className="pf-card">
                <p>Você ainda não fez pedidos. <Link to="/produtos" className="pf-link">Ver produtos</Link></p>
              </section>
            )}
            {orders?.map((o) => (
              <Link key={o.id} to={`/pedido/${o.id}`} className="pf-order">
                <div className="pf-row">
                  <strong>Pedido #{o.id}</strong>
                  <span className={`pf-status s-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </div>
                <div className="pf-row">
                  <span>Para {formatDate(o.delivery_date)}</span>
                  <strong>{formatBRL(o.subtotal_cents)}</strong>
                </div>
                <small>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</small>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
