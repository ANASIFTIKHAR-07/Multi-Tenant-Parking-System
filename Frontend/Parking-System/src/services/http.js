export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function httpRequest(path, { method = 'GET', body, headers = {}, query } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJSON = contentType.includes('application/json');
  const data = isJSON ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJSON ? (data?.message || data?.error || 'Request failed') : data;
    throw new Error(message);
  }
  return data;
}

export const http = {
  get: (path, options) => httpRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => httpRequest(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => httpRequest(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => httpRequest(path, { ...options, method: 'PUT', body }),
  del: (path, options) => httpRequest(path, { ...options, method: 'DELETE' }),
};
