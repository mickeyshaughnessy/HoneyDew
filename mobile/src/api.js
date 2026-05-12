/**
 * HoneyDew API client for React Native.
 * Mirrors the web app's /api/* routes — all auth is session-cookie based on the server;
 * the mobile client stores the session cookie via a persistent cookie jar.
 *
 * Set API_BASE to your deployed HoneyDew server URL.
 */
import * as SecureStore from 'expo-secure-store';

export const API_BASE = 'https://honeydew.example.com'; // override per environment

// Simple cookie jar — stores the Set-Cookie header value and re-sends it.
const COOKIE_KEY = 'hd_session_cookie';

async function getStoredCookie() {
  try { return await SecureStore.getItemAsync(COOKIE_KEY); }
  catch { return null; }
}

async function storeCookie(value) {
  try { await SecureStore.setItemAsync(COOKIE_KEY, value); }
  catch {}
}

export async function clearSession() {
  try { await SecureStore.deleteItemAsync(COOKIE_KEY); }
  catch {}
}

async function req(method, path, body) {
  const cookie = await getStoredCookie();
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;

  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  // Persist session cookie
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) await storeCookie(setCookie.split(';')[0]);

  let data;
  try { data = await res.json(); }
  catch { data = {}; }

  return { ok: res.ok, status: res.status, data };
}

const get  = (path)        => req('GET',    path);
const post = (path, body)  => req('POST',   path, body);
const del  = (path)        => req('DELETE', path);

// Auth
export const register = (username, password) =>
  post('/api/register', { username, password });

export const login = (username, password) =>
  post('/api/login', { username, password });

export const logout = () =>
  post('/api/logout', {});

export const me = () => get('/api/me');

// Bids
export const getBids = () => get('/api/bids');

export const submitBid = ({ category, description, address, price, payment_method = 'credit_card' }) =>
  post('/api/bids', { category, description, address, price, payment_method });

export const cancelBid = (bidId) => del(`/api/bids/${bidId}`);

// Jobs
export const getJobs = () => get('/api/jobs');

export const signJob = (jobId, rating) =>
  post(`/api/jobs/${jobId}/sign`, { rating });

// Discovery
export const nearby = (address) =>
  get(`/api/nearby?address=${encodeURIComponent(address)}`);
