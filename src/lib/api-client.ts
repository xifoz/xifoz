const API_BASE = (import.meta.env['VITE_API_URL'] as string) ?? 'http://localhost:4000';

export interface ApiErrorDetail {
  [key: string]: string[];
}

export class ApiError extends Error {
  status: number;
  errors?: ApiErrorDetail;

  constructor(message: string, status: number, errors?: ApiErrorDetail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let unauthorizedHandler: (() => void) | null = null;

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export const apiClient = {
  setAccessToken(token: string | null) {
    accessToken = token;
  },

  getAccessToken() {
    return accessToken;
  },

  onUnauthorized(handler: () => void) {
    unauthorizedHandler = handler;
  },

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    const headers = new Headers(options.headers);

    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // essential for HttpOnly cookies (refresh token)
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Attempt to refresh access token if it's expired
        // Avoid infinite loop if we are already requesting refresh token
        if (path === '/api/auth/refresh') {
          if (unauthorizedHandler) {
            unauthorizedHandler();
          }
          const errData = await response.json().catch(() => ({})) as { message?: string; errors?: ApiErrorDetail };
          throw new ApiError(
            errData.message ?? 'Authentication failed',
            response.status,
            errData.errors
          );
        }

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!refreshResponse.ok) {
              throw new Error('Failed to refresh token');
            }

            const refreshData = await refreshResponse.json() as {
              success: boolean;
              data: { accessToken: string };
            };

            const newToken = refreshData.data.accessToken;
            accessToken = newToken;
            isRefreshing = false;
            onRefreshed(newToken);
          } catch {
            isRefreshing = false;
            accessToken = null;
            refreshSubscribers = [];
            if (unauthorizedHandler) {
              unauthorizedHandler();
            }
            throw new ApiError('Session expired. Please log in again.', 401);
          }
        }

        // Wait for the token refresh to complete, then retry the request
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            const retryHeaders = new Headers(config.headers);
            retryHeaders.set('Authorization', `Bearer ${newToken}`);
            fetch(url, { ...config, headers: retryHeaders })
              .then(async (retryRes) => {
                if (!retryRes.ok) {
                  const errData = await retryRes.json().catch(() => ({})) as { message?: string; errors?: ApiErrorDetail };
                  reject(new ApiError(
                    errData.message ?? 'Request failed after refresh retry',
                    retryRes.status,
                    errData.errors
                  ));
                } else {
                  const text = await retryRes.text();
                  const data = (text ? JSON.parse(text) : null) as T;
                  resolve(data);
                }
              })
              .catch((err) => reject(err));
          });
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({})) as { message?: string; errors?: ApiErrorDetail };
        throw new ApiError(
          errData.message ?? 'An error occurred during the request',
          response.status,
          errData.errors
        );
      }

      // Safe JSON parse for responses that might be empty or not return valid JSON
      const text = await response.text();
      return (text ? JSON.parse(text) : null) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        500
      );
    }
  },

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};
