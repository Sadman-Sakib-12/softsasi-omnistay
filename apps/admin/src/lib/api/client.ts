import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { sessionManager } from '../auth/session';
import { ApiError } from './errors';

const DEFAULT_REMOTE_URL = 'https://omnistay-backend.onrender.com';

const BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? DEFAULT_REMOTE_URL : 'http://localhost:4000');

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionManager.getToken();
    const tenantId = sessionManager.getTenantId();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId && config.headers) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Backend service request failed';

    // Automatic Silent Token Refresh Interceptor (Sakib Project Plan Chapter 1 & 19)
    if (
      statusCode === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/v1/auth/login') &&
      !originalRequest.url?.includes('/api/v1/auth/refresh')
    ) {
      const refreshToken = sessionManager.getRefreshToken();

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = refreshRes.data?.accessToken;
          const newRefreshToken = refreshRes.data?.refreshToken;

          if (newAccessToken) {
            sessionManager.setToken(newAccessToken, newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            processQueue(null, newAccessToken);
            isRefreshing = false;

            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          sessionManager.clear();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(new ApiError('Session expired. Please log in again.', 401));
        }
      } else {
        sessionManager.clear();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new ApiError(message, statusCode, error.response?.data));
  }
);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config) as unknown as Promise<T>,
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config) as unknown as Promise<T>,
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config) as unknown as Promise<T>,
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config) as unknown as Promise<T>,
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config) as unknown as Promise<T>,
};
