import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const requestUrl = String(error.config?.url || '');
        const isAuthBootstrapRequest = requestUrl === '/me' || requestUrl.endsWith('/me');

        if (!isAuthBootstrapRequest && pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
