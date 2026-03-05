const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const STORAGE_KEY = 'bizcenter_session';

function getAccessToken(): string | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved).accessToken ?? null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved).refreshToken ?? null;
  } catch {
    return null;
  }
}

function updateTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const session = JSON.parse(saved);
  session.accessToken = accessToken;
  session.refreshToken = refreshToken;
  session.expiresIn = expiresIn;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
  window.location.href = '/';
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const rt = getRefreshToken();
      if (!rt) return false;
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      updateTokens(data.accessToken, data.refreshToken, data.expiresIn);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  skipAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 → try refresh once
  if (res.status === 401 && !skipAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } else {
      clearSession();
      throw new ApiError(401, 'UNAUTHORIZED', '인증이 만료되었습니다.');
    }
  }

  if (!res.ok) {
    let errBody: any = {};
    try { errBody = await res.json(); } catch {}
    throw new ApiError(
      res.status,
      errBody.code || 'UNKNOWN',
      errBody.message || `요청 실패 (${res.status})`,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T>(path: string, skipAuth = false) => request<T>('GET', path, undefined, skipAuth),
  post: <T>(path: string, body?: unknown, skipAuth = false) => request<T>('POST', path, body, skipAuth),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export function createSSE(storeId: number, onEvent: (event: string, data: any) => void): EventSource {
  const url = `${BASE_URL}/api/sse/admin/${storeId}`;
  const es = new EventSource(url);
  es.addEventListener('CONNECTED', () => {
    // connected successfully
  });
  es.addEventListener('ORDER_CREATED', (e: any) => {
    try {
      const data = JSON.parse(e.data);
      onEvent('ORDER_CREATED', data);
    } catch {}
  });
  es.onerror = () => {
    // reconnection handled automatically by EventSource
  };
  return es;
}

export { BASE_URL };
