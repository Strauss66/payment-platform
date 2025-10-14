import { api } from './apiClient';

export async function globalSearch(params){ const { data } = await api.get('/api/search', { params }); return data; }

