// Thin fetch wrapper: adds the base URL, JSON headers, and the bearer token.
// VITE_API_URL lets you point the frontend at a separately-hosted API;
// leave it unset when the API is deployed on the same Vercel project
// (requests then go to the relative "/api/..." path).
const env = /** @type {{ VITE_API_URL?: string }} */ (
  typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}
);
const API_BASE = env.VITE_API_URL || '';

const TOKEN_KEY = 'rentalls_access_token';

export function getToken() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} token
 */
export function setToken(token) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore (e.g. private browsing) */
  }
}

class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {unknown} data
   */
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, headers?: Record<string, string>, isFormData?: boolean }} [options]
 */
export async function request(path, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  const token = getToken();
  const finalHeaders = /** @type {Record<string, string>} */ ({ ...headers });
  if (!isFormData) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: finalHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data;
}

export { ApiError };
