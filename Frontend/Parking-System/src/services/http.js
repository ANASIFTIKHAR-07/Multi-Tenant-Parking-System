export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Token helpers (localStorage) ─────────────────────────────────────────────
// Cross-origin cookies are blocked by browsers between Vercel and Render.
// We persist the access token in localStorage and send it as a Bearer header.
const TOKEN_KEY = 'pk_access_token';
export const getToken    = ()      => localStorage.getItem(TOKEN_KEY);
export const setToken    = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken  = ()      => localStorage.removeItem(TOKEN_KEY);

// Single in-flight refresh promise — prevents parallel refresh storms
let refreshInFlight = null;

export async function tryRefreshSession() {
  if (!refreshInFlight) {
    const url = new URL(`${API_BASE_URL}/auth/refresh-token`);
    refreshInFlight = fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (r) => {
        if (!r.ok) return false;
        try {
          const data = await r.json();
          // Store the freshly issued access token
          const newToken = data?.message?.accessToken || data?.data?.accessToken;
          if (newToken) setToken(newToken);
        } catch { /* ignore parse errors */ }
        return true;
      })
      .catch(() => false)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url;
}

function shouldSkipRefresh(path) {
  return path === '/auth/login' || path === '/auth/refresh-token';
}

const REQUEST_TIMEOUT_MS = 60_000; // 60s — accounts for Render free-tier cold start (~30-50s)
const SLOW_REQUEST_THRESHOLD_MS = 8_000; // warn user after 8s

async function httpRequestInternal(path, { method = 'GET', body, headers = {}, query, onSlow } = {}, isRetry = false) {
  const url = buildUrl(path, query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Notify caller if the request is taking unusually long (Render cold start)
  const slowTimer = onSlow ? setTimeout(() => onSlow(), SLOW_REQUEST_THRESHOLD_MS) : null;

  let response;
  try {
    const token = getToken();
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
    response = await fetch(url.toString(), {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...authHeader, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. The server may be starting up — please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
    if (slowTimer) clearTimeout(slowTimer);
  }

  // Auto-refresh on 401 (once, skip auth endpoints to avoid loops)
  if (response.status === 401 && !isRetry && !shouldSkipRefresh(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return httpRequestInternal(path, { method, body, headers, query, onSlow }, true);
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const data = isJSON ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJSON ? (data?.message || data?.error || 'Request failed') : (data || 'Request failed');
    throw new Error(message);
  }
  return data;
}

export async function httpRequest(path, options) {
  return httpRequestInternal(path, options ?? {}, false);
}

// ── CSV download helper ──────────────────────────────────────────────────────
function filenameFromDisposition(cd) {
  if (!cd) return null;
  const m = /filename\*?=(?:UTF-8'')?["']?([^";\n]+)["']?/i.exec(cd);
  return m ? decodeURIComponent(m[1].trim()) : null;
}

export async function downloadCsv(path, query) {
  const url = buildUrl(path, query);

  const doFetch = () => fetch(url.toString(), { method: 'GET', credentials: 'include' });

  let response = await doFetch();
  if (response.status === 401) {
    if (await tryRefreshSession()) response = await doFetch();
  }

  if (!response.ok) {
    const ct = response.headers.get('content-type') || '';
    let msg = 'Export failed';
    if (ct.includes('application/json')) {
      try { const j = await response.json(); msg = j.message || msg; } catch { /* ignore */ }
    } else {
      const t = await response.text();
      if (t) msg = t.slice(0, 200);
    }
    throw new Error(msg);
  }

  const blob = await response.blob();
  const filename =
    filenameFromDisposition(response.headers.get('Content-Disposition')) ||
    `${path.replace(/^\//, '').replace(/\//g, '_')}.csv`;

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// ── File upload helper (multipart/form-data) ─────────────────────────────────
export async function uploadFile(path, file, fieldName = 'file') {
  const url = new URL(`${API_BASE_URL}${path}`);
  const formData = new FormData();
  formData.append(fieldName, file);

  const token = getToken();
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  let response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: { ...authHeader }, // Do NOT set Content-Type — browser sets it with boundary
    body: formData,
  });

  // Auto-refresh on 401
  if (response.status === 401) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const retryToken = getToken();
      const retryAuth = retryToken ? { 'Authorization': `Bearer ${retryToken}` } : {};
      response = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
        headers: { ...retryAuth },
        body: formData,
      });
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Upload failed');
  }
  return data;
}

export const http = {
  get:   (path, options)       => httpRequest(path, { ...options, method: 'GET' }),
  post:  (path, body, options) => httpRequest(path, { ...options, method: 'POST',  body }),
  patch: (path, body, options) => httpRequest(path, { ...options, method: 'PATCH', body }),
  put:   (path, body, options) => httpRequest(path, { ...options, method: 'PUT',   body }),
  del:   (path, options)       => httpRequest(path, { ...options, method: 'DELETE' }),
};
