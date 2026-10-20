import api from './api';

export const postService = {
  getFeed: async (page = 1, limit = 10) => {
    const res = await api.get(`/feed?page=${page}&limit=${limit}`);
    return res.data;
  },

  getFollowingFeed: async (page = 1, limit = 10) => {
    const res = await api.get(`/feed/following?page=${page}&limit=${limit}`);
    return res.data;
  },

  getLatestFeed: async (page = 1, limit = 10) => {
    const res = await api.get(`/feed/latest?page=${page}&limit=${limit}`);
    return res.data;
  },

  getPostById: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  createPost: async (postData) => {
    const res = await api.post('/posts', postData);
    return res.data;
  },

  updatePost: async (id, postData) => {
    const res = await api.patch(`/posts/${id}`, postData);
    return res.data;
  },

  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  likePost: async (id, reaction = 'like') => {
    const res = await api.put(`/posts/${id}/like`, { reaction });
    return res.data;
  },

  unlikePost: async (id) => {
    const res = await api.delete(`/posts/${id}/like`);
    return res.data;
  },

  toggleBookmark: async (id) => {
    const res = await api.put(`/posts/${id}/bookmark`);
    return res.data;
  },

  getBookmarks: async (page = 1, limit = 10) => {
    const res = await api.get(`/bookmarks?page=${page}&limit=${limit}`);
    return res.data;
  },

  getComments: async (postId, page = 1) => {
    const res = await api.get(`/posts/${postId}/comments?page=${page}`);
    return res.data;
  },

  createComment: async (postId, commentData) => {
    const res = await api.post(`/posts/${postId}/comments`, commentData);
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};
