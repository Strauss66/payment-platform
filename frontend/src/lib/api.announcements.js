import { api } from './apiClient';

export const announcementsApi = {
  // Admin endpoints
  list: async (params = {}) => api.get('/api/announcements', { params }),
  create: async (payload) => api.post('/api/announcements', payload),
  update: async (id, payload) => api.put(`/api/announcements/${id}`, payload),
  remove: async (id) => api.delete(`/api/announcements/${id}`),

  // Portal feed
  feed: async (params = {}) => api.get('/api/announcements/visible', { params })
};


