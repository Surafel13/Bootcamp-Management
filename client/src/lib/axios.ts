import axios from 'axios';
import { store } from '../app/store';
import { clearCredentials } from '../features/auth/authSlice';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_ROUTES = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/switch-role'];

api.interceptors.response.use(
  res => res,
  err => {
    const requestUrl = err.config?.url ?? '';
    const isAuthRoute = AUTH_ROUTES.some(route => requestUrl.includes(route));
    const isUnauthorized = err.response?.status === 401;

    if (isUnauthorized && !isAuthRoute) {
      store.dispatch(clearCredentials());
      window.location.replace('/login');
    }

    return Promise.reject(err);
  }
);

export default api;
