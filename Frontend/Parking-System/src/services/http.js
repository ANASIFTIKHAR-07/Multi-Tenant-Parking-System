export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
      .then(r => r.ok)
      .catch(() => false)          // network error → treat as failed
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

const REQUEST_TIMEOUT_MS = 15_000;

async function httpRequestInternal(path, { method = 'GET', body, headers = {}, query } = {}, isRetry = false) {
  const url = buildUrl(path, query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }

  // Auto-refresh on 401 (once, skip auth endpoints to avoid loops)
  if (response.status === 401 && !isRetry && !shouldSkipRefresh(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return httpRequestInternal(path, { method, body, headers, query }, true);
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
  return httpRequestInternal(path, options, false);
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

export const http = {
  get:   (path, options)       => httpRequest(path, { ...options, method: 'GET' }),
  post:  (path, body, options) => httpRequest(path, { ...options, method: 'POST',  body }),
  patch: (path, body, options) => httpRequest(path, { ...options, method: 'PATCH', body }),
  put:   (path, body, options) => httpRequest(path, { ...options, method: 'PUT',   body }),
  del:   (path, options)       => httpRequest(path, { ...options, method: 'DELETE' }),
};
