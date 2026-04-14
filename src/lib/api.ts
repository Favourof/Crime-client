import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { getToken, setToken, removeToken } from './auth';

const baseUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
const baseUrl = baseUrlRaw.endsWith('/api')
  ? baseUrlRaw
  : `${baseUrlRaw.replace(/\/$/, '')}/api`;

if (!baseUrl) {
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_API_BASE_URL is not set');
}

class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown[];
}

const apiInstance = axios.create({
  baseURL: baseUrl,
});

apiInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = config.data instanceof FormData;
  if (!isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; details?: unknown[] }>) => {
    const payload = error.response?.data;
    const normalizedError = new ApiError(payload?.message || error.message || 'Request failed');
    normalizedError.status = error.response?.status;
    normalizedError.code = payload?.code || 'REQUEST_ERROR';
    normalizedError.details = payload?.details || [];
    return Promise.reject(normalizedError);
  }
);

const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiInstance.request<T>(config);
  return response.data;
};

export const api = {
  get: <T>(path: string) => request<T>({ url: path, method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>({ url: path, method: 'POST', data: body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>({ url: path, method: 'PUT', data: body }),
  delete: <T>(path: string) => request<T>({ url: path, method: 'DELETE' }),
};

export { getToken, setToken, removeToken };
