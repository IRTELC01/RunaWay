// Permite configurar la URL del API vía variable de entorno en despliegue.
// Si VITE_API_URL no incluye "/api", se agrega automáticamente.
let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
if (!/\/api\/?$/.test(API_BASE)) {
  API_BASE = API_BASE.replace(/\/+$/, '') + '/api'
}
const API_URL = API_BASE

// Helper: manejar 401 borrando token y redirigiendo a /login
async function jsonWithAuth(response) {
  if (response.status === 401) {
    try { localStorage.removeItem('runaway_token') } catch {}
    // Intentar leer mensaje de error, pero no bloquear si falla
    let body = null
    try { body = await response.json() } catch {}
    try { window.location.href = '/login' } catch {}
    return body || { error: 'No autorizado' }
  }
  return response.json()
}

export async function register(username, password) {
  const r = await fetch(`${API_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return r.json();
}

export async function registerPhone(username, password, phone) {
  const r = await fetch(`${API_URL}/auth/register-phone`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, phone }),
  });
  return r.json();
}

export async function setup2fa(username) {
  const r = await fetch(`${API_URL}/auth/setup-2fa`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  return r.json();
}

export async function login(username, password, token) {
  const r = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, token }),
  });
  return r.json();
}

export async function requestOtp(phone) {
  const r = await fetch(`${API_URL}/auth/request-otp`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return r.json();
}

export async function loginPhone(phone, code) {
  const r = await fetch(`${API_URL}/auth/login-phone`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  return r.json();
}

export function setToken(token) { localStorage.setItem('runaway_token', token); }
export function getToken() { return localStorage.getItem('runaway_token'); }

export async function createInvoice(payload) {
  const r = await fetch(`${API_URL}/invoices`, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    }, body: JSON.stringify(payload),
  });
  return jsonWithAuth(r);
}

export async function listInvoices() {
  const r = await fetch(`${API_URL}/invoices`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return jsonWithAuth(r);
}

export async function addTransaction(payload) {
  const r = await fetch(`${API_URL}/accounting/transactions`, {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    }, body: JSON.stringify(payload),
  });
  return jsonWithAuth(r);
}

export async function getSummary() {
  const r = await fetch(`${API_URL}/accounting/summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return jsonWithAuth(r);
}