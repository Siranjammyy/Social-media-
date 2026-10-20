import api from './api';

export const userService = {
  getProfile: async (username) => {
    const res = await api.get(`/users/${username}`);
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.patch('/users/me', profileData);
    return res.data;
  },

  completeOnboarding: async (data) => {
    const res = await api.post('/users/onboarding', data);
    return res.data;
  },

  getUserPosts: async (username, tab = 'posts', page = 1) => {
    const res = await api.get(`/users/${username}/posts?tab=${tab}&page=${page}`);
    return res.data;
  },

  followUser: async (userId) => {
    const res = await api.post(`/users/${userId}/follow`);
    return res.data;
  },

  unfollowUser: async (userId) => {
    const res = await api.delete(`/users/${userId}/follow`);
    return res.data;
  },

  getFollowers: async (username, page = 1) => {
    const res = await api.get(`/users/${username}/followers?page=${page}`);
    return res.data;
  },

  getFollowing: async (username, page = 1) => {
    const res = await api.get(`/users/${username}/following?page=${page}`);
    return res.data;
  },

  getSuggestions: async (limit = 5) => {
    const res = await api.get(`/users/suggestions?limit=${limit}`);
    return res.data;
  },

  blockUser: async (userId) => {
    const res = await api.post(`/users/${userId}/block`);
    return res.data;
  },

  unblockUser: async (userId) => {
    const res = await api.post(`/users/${userId}/unblock`);
    return res.data;
  },

  toggleMute: async (userId) => {
    const res = await api.post(`/users/${userId}/mute`);
    return res.data;
  },

  deleteAccount: async () => {
    const res = await api.delete('/users/me');
    return res.data;
  },
};
