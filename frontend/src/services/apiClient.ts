const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('sbg_token');
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseData = isJson ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('sbg_token');
        localStorage.removeItem('sbg_user');
        if (!window.location.hash.includes('/login') && !window.location.hash.includes('/signup')) {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }

      const message = responseData?.message || responseData?.error || `HTTP ${response.status} error`;
      throw new ApiError(message, response.status, responseData);
    }

    return responseData;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || 'Network request failed. Please check your connection.',
      0,
      null
    );
  }
}
