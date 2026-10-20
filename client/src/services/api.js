import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token') || localStorage.getItem('nexora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      // Clear token if expired
      localStorage.removeItem('aura_token');
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('aura_user');
      localStorage.removeItem('nexora_user');
      // If on a private page, we can trigger re-auth or redirect
    }
    return Promise.reject(error);
  }
);

export default api;
