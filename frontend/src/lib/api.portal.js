import { api } from './apiClient';

export async function getMyStudents() { const { data } = await api.get('/api/portal/my-students'); return Array.isArray(data) ? data : []; }
export async function getPortalStatement(studentId) { const { data } = await api.get(`/api/portal/statement/${encodeURIComponent(studentId)}`); return data; }
export async function getPortalSummary() { const { data } = await api.get('/api/portal/summary'); return data; }
export async function getPortalPayments(params = {}) { const { data } = await api.get('/api/portal/payments', { params }); return Array.isArray(data?.rows) ? data : { rows: [], count: 0 }; }


