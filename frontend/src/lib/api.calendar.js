import { api } from './apiClient';

export const calendarsApi = {
  list: () => api.get('/api/calendars').then(r=>r.data),
  create: (p) => api.post('/api/calendars', p).then(r=>r.data),
  update: (id, p) => api.put(`/api/calendars/${id}`, p).then(r=>r.data),
  remove: (id) => api.delete(`/api/calendars/${id}`).then(r=>r.data)
};

export const eventsApi = {
  list: (params) => api.get('/api/events', { params }).then(r=>r.data),
  create: (p) => api.post('/api/events', p).then(r=>r.data),
  update: (id, p) => api.put(`/api/events/${id}`, p).then(r=>r.data),
  remove: (id) => api.delete(`/api/events/${id}`).then(r=>r.data)
};


