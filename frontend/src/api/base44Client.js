// Drop-in replacement for the old @base44/sdk client.
//
// The rest of the app talks to `base44.auth.*`, `base44.entities.<Name>.*`
// and `base44.integrations.Core.*` exactly as before -- only what happens
// underneath changed: it's now our own Express API on Vercel, backed by
// MongoDB Atlas, instead of base44's hosted backend.
import { request, getToken, setToken } from './httpClient';

/**
 * @param {string} url
 * @param {Record<string, any>} [options]
 */
function requestWithBody(url, options = {}) {
  return request(url, options);
}

const ENTITY_NAMES = [
  'ChatMessage',
//  'Client',
  'Concern',
  'Notice',
  'Payment',
  'PlatformConfig',
  'Product',
  'Rating',
  'Seller',
  'Showroom',
  'ShowroomMessage',
];

/**
 * @param {string} name
 * @returns {object}
 */
function buildEntityApi(name) {
  return {
    async list(sort = '-created_date', limit = 200) {
      const qs = new URLSearchParams({ sort, limit: String(limit) });
      return request(`/entities/${name}?${qs.toString()}`);
    },
    async filter(query = {}, sort = '-created_date', limit = 200) {
      const qs = new URLSearchParams({
        sort,
        limit: String(limit),
        filter: JSON.stringify(query),
      });
      return request(`/entities/${name}?${qs.toString()}`);
    },
    /**
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    async get(id) {
      const results = await request(`/entities/${name}?${new URLSearchParams({
        filter: JSON.stringify({ _id: id }),
        limit: '1',
      })}`);
      return results[0] || null;
    },
    /**
     * @param {object} data
     */
    async create(data) {
      return requestWithBody(`/entities/${name}`, { method: 'POST', body: data });
    },
    /**
     * @param {string} id
     * @param {object} data
     */
    async update(id, data) {
      return requestWithBody(`/entities/${name}/${id}`, { method: 'PUT', body: data });
    },
    /**
     * @param {string} id
     */
    async delete(id) {
      return request(`/entities/${name}/${id}`, { method: 'DELETE' });
    },
    // Real-time subscriptions aren't provided by the plain REST API -- this
    // lightweight polling shim keeps existing components (chat, showroom,
    // etc.) working unchanged. Swap for a WebSocket/SSE feed if you need
    // sub-second updates.
    /**
     * @param {(payload: { data: Record<string, unknown> }) => void} callback
     * @param {{ intervalMs?: number }} [options]
     */
    subscribe(callback, { intervalMs = 4000 } = {}) {
      const interval = setInterval(() => {
        callback({ data: {} }); // components re-fetch on any event
      }, intervalMs);
      return () => clearInterval(interval);
    },
  };
}

const entities = ENTITY_NAMES.reduce((acc, name) => {
  acc[name] = buildEntityApi(name);
  return acc;
}, /** @type {Record<string, ReturnType<typeof buildEntityApi>>} */ ({}));

/**
 * @typedef {{ email: string, password: string }} AuthCredentials
 * @typedef {{ email: string, otpCode: string }} OtpCredentials
 * @typedef {{ token: string, password: string }} PasswordResetCredentials
 */

const auth = {
  async me() {
    return request('/auth/me');
  },
  async updateMe(
    /**
     * @param {Record<string, any>} data
     */
    data = {}
  ) {
    return requestWithBody('/auth/me', { method: 'PUT', body: data });
  },
  /**
   * @param {AuthCredentials} credentials
   */
  async register(credentials) {
    const { email, password } = credentials;
    return requestWithBody('/auth/register', { method: 'POST', body: { email, password } });
  },
  /**
   * @param {OtpCredentials} credentials
   */
  async verifyOtp(credentials) {
    const { email, otpCode } = credentials;
    const result = await requestWithBody('/auth/verify-otp', { method: 'POST', body: { email, otpCode } });
    if (result?.access_token) setToken(result.access_token);
    return result;
  },
  /**
   * @param {string} email
   */
  async resendOtp(email) {
    return requestWithBody('/auth/resend-otp', { method: 'POST', body: { email } });
  },
  /**
   * @param {AuthCredentials} credentials
   */
  async login(credentials) {
    const { email, password } = credentials;
    const result = await requestWithBody('/auth/login', { method: 'POST', body: { email, password } });
    if (result?.access_token) setToken(result.access_token);
    return result;
  },
  /**
   * @param {string} email
   * @param {string} password
   */
  async loginViaEmailPassword(email, password) {
    return this.login({ email, password });
  },
  /**
   * @param {string} email
   */
  async resetPasswordRequest(email) {
    return requestWithBody('/auth/reset-password-request', { method: 'POST', body: { email } });
  },
  /**
   * @param {PasswordResetCredentials} credentials
   */
  async resetPassword(credentials) {
    const { token, password } = credentials;
    return requestWithBody('/auth/reset-password', { method: 'POST', body: { token, password } });
  },
  /**
   * @param {string | null | undefined} token
   */
  setToken(token) {
    setToken(token);
  },
  getToken,
  /**
   * @param {string | null | undefined} redirectTo
   */
  logout(redirectTo) {
    setToken(null);
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  },
  // Google OAuth isn't wired up out of the box in this rebuild (it needs
  // your own Google Cloud OAuth credentials). This stub tells the user
  // instead of silently failing -- see README.md "Adding Google Sign-In".
  /**
   * @param {string} _provider
   * @param {string} [_redirectTo]
   */
  loginWithProvider(_provider, _redirectTo) {
    alert('Google sign-in isn\'t configured yet. See README.md for setup steps.');
  },
  /**
   * @param {string | null | undefined} redirectTo
   */
  redirectToLogin(redirectTo) {
    if (typeof window !== 'undefined') {
      const back = encodeURIComponent(redirectTo || window.location.href);
      window.location.href = `/login?redirect=${back}`;
    }
  },
};

/**
 * @typedef {{
 *   to: string,
 *   subject: string,
 *   body?: string,
 *   html?: string
 * }} EmailSendProps
 */

const integrations = {
  Core: {
    /**
     * @param {{ file: File }} props
     */
    async UploadFile({ file }) {
      const formData = new FormData();
      formData.append('file', file);
      return requestWithBody('/upload', { method: 'POST', body: formData, isFormData: true });
    },
    /**
     * @param {EmailSendProps} props
     */
    async SendEmail(props) {
      const { to, subject, body, html } = props;
      return requestWithBody('/email/send', { method: 'POST', body: { to, subject, body, html } });
    },
  },
};

export const base44 = { auth, entities, integrations };
