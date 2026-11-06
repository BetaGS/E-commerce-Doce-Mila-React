// src/services/api.js
// Cliente HTTP da API Flask. Em desenvolvimento usa o proxy do Vite (/api).
// Em produção, defina VITE_API_URL=https://sua-api.onrender.com
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const getToken = () => localStorage.getItem('token');

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Tente novamente.', 0);
  }

  let data = {};
  try { data = await response.json(); } catch { /* resposta sem corpo */ }

  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('auth:expired'));
    if (!data.error) {
      // Resposta que não veio da nossa API (ex.: página 404 do site estático): provável VITE_API_URL ausente
      console.error(`API inesperada: ${response.status} em ${BASE}/api${path}. Confira o VITE_API_URL.`);
    }
    throw new ApiError(data.error || 'Não foi possível carregar os dados do servidor. Tente novamente em instantes.', response.status, data.fields);
  }
  return data;
}

export const api = {
  config: () => request('/config', { auth: false }),
  products: () => request('/products', { auth: false }),
  categories: () => request('/categories', { auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/password', { method: 'POST', body: payload }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: payload, auth: false }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  myOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  syncOrder: (id) => request(`/orders/${id}/sync`, { method: 'POST' }),
  changePayment: (id, method) => request(`/orders/${id}/payment`, { method: 'POST', body: { payment_method: method } }),
  adminOrders: (status) => request(`/admin/orders${status ? `?status=${status}` : ''}`),
  adminSetStatus: (id, status) => request(`/admin/orders/${id}`, { method: 'PATCH', body: { status } }),
  adminConfirmPayment: (id) => request(`/admin/orders/${id}/confirm-payment`, { method: 'POST', body: {} }),
};
