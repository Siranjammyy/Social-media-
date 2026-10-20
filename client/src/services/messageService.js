import api from './api';

export const messageService = {
  getConversations: async () => {
    const res = await api.get('/conversations');
    return res.data;
  },

  getOrCreateConversation: async (participantId) => {
    const res = await api.post('/conversations', { participantId });
    return res.data;
  },

  getMessages: async (conversationId, page = 1) => {
    const res = await api.get(`/conversations/${conversationId}/messages?page=${page}`);
    return res.data;
  },

  sendMessage: async (conversationId, content, attachments = []) => {
    const res = await api.post(`/conversations/${conversationId}/messages`, {
      content,
      attachments,
    });
    return res.data;
  },
};

export const notificationService = {
  getNotifications: async (page = 1) => {
    const res = await api.get(`/notifications?page=${page}`);
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export const uploadService = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append('files', file));
    } else {
      formData.append('files', files);
    }

    const res = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export const searchService = {
  searchUsers: async (q) => {
    const res = await api.get(`/search/users?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  searchPosts: async (q, tag = null, page = 1) => {
    let url = `/search/posts?page=${page}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    else if (q) url += `&q=${encodeURIComponent(q)}`;
    const res = await api.get(url);
    return res.data;
  },

  getTrending: async () => {
    const res = await api.get('/search/trending');
    return res.data;
  },
};

export const reportService = {
  submitReport: async (reportData) => {
    const res = await api.post('/reports', reportData);
    return res.data;
  },
};

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async (page = 1, q = '') => {
    const res = await api.get(`/admin/users?page=${page}&q=${encodeURIComponent(q)}`);
    return res.data;
  },
  toggleSuspend: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/suspend`);
    return res.data;
  },
};
