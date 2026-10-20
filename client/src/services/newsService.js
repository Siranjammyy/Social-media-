import api from './api';

export const newsService = {
  getNews: async (category = 'all', page = 1, limit = 10) => {
    const res = await api.get(`/news?category=${category}&page=${page}&limit=${limit}`);
    return res.data;
  },

  getBreakingNews: async () => {
    const res = await api.get('/news/breaking');
    return res.data;
  },

  getWhatsHappening: async () => {
    const res = await api.get('/news/whats-happening');
    return res.data;
  },

  getNewsById: async (id) => {
    const res = await api.get(`/news/${id}`);
    return res.data;
  },
};
