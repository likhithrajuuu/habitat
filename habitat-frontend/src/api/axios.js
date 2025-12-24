import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const url = (config?.url || '').toString();
  const isPublicAuthCall =
    url.startsWith('/api/auth/') ||
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.startsWith('/oauth2/') ||
    url.includes('/oauth2/');

  if (isPublicAuthCall) return config;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
