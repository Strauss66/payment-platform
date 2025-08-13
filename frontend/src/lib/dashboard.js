import { api } from './apiClient';

export async function fetchDashboardLayout(view = 'portal') {
  const { data } = await api.get(`/api/dashboard/layouts/${encodeURIComponent(view)}`);
  return data?.layout || [];
}

export async function saveDashboardLayout(view, layout) {
  const { data } = await api.put(`/api/dashboard/layouts/${encodeURIComponent(view)}`, { layout });
  return data?.layout || [];
}


