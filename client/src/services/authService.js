import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  demoLogin: async (role = 'admin') => {
    const res = await api.post('/auth/demo-login', { role });
    return res.data;
  },

  getDemoUsers: async () => {
    const res = await api.get('/auth/demo-users');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  updatePassword: async (passwords) => {
    const res = await api.post('/auth/update-password', passwords);
    return res.data;
  },
};
