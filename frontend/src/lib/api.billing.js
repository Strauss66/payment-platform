import { api } from './apiClient';

export class NoTenantError extends Error {
  constructor(message = 'No tenant selected') { super(message); this.name = 'NoTenantError'; }
}
function normalizeStatus(input) {
  if (!input) return undefined;
  if (Array.isArray(input)) return input;
  const str = String(input);
  // support CSV or pipe-delimited
  return str.split(/[|,]/).map(s => s.trim()).filter(Boolean);
}


function ensureTenant() {
  const id = localStorage.getItem('tenant.schoolId');
  if (!id) throw new NoTenantError();
  return id;
}

// Invoicing Entities
export async function listInvoicingEntities(params = {}) {
  ensureTenant();
  const { data } = await api.get('/api/billing/invoicing-entities', { params });
  const rows = Array.isArray(data) ? data : [];
  return { rows, count: rows.length };
}

export async function createInvoicingEntity(payload) {
  ensureTenant();
  const { data } = await api.post('/api/billing/invoicing-entities', payload);
  return data;
}

export async function updateInvoicingEntity(id, payload) {
  ensureTenant();
  const { data } = await api.put(`/api/billing/invoicing-entities/${id}`, payload);
  return data;
}

export async function deleteInvoicingEntity(id) {
  ensureTenant();
  await api.delete(`/api/billing/invoicing-entities/${id}`);
  return { ok: true };
}

// Cash Registers
export async function listCashRegisters(params = {}) {
  ensureTenant();
  const { data } = await api.get('/api/billing/cash-registers', { params });
  const rows = Array.isArray(data) ? data : [];
  return { rows, count: rows.length };
}

export async function createCashRegister(payload) {
  ensureTenant();
  const { data } = await api.post('/api/billing/cash-registers', payload);
  return data;
}

export async function updateCashRegister(id, payload) {
  ensureTenant();
  const { data } = await api.put(`/api/billing/cash-registers/${id}`, payload);
  return data;
}

export async function deleteCashRegister(id) {
  ensureTenant();
  await api.delete(`/api/billing/cash-registers/${id}`);
  return { ok: true };
}

// Payments (list)
export async function listPayments(params = {}, config = {}) {
  ensureTenant();
  try {
    const { signal, status, sort, ...restParams } = params || {};
    const finalParams = { ...restParams };
    const normStatus = normalizeStatus(status);
    if (Array.isArray(normStatus)) finalParams.status = normStatus;
    if (typeof sort === 'object' && sort && sort.field && sort.dir) finalParams.sort = `${sort.field}:${sort.dir}`;
    const axiosConfig = { ...(config || {}), params: { ...(config?.params || {}), ...(finalParams || {}) }, ...(signal ? { signal } : {}) };
    const { data } = await api.get('/api/billing/payments', axiosConfig);
    if (Array.isArray(data?.rows)) return data;
    const rows = Array.isArray(data) ? data : [];
    return { rows, count: rows.length };
  } catch (e) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return { rows: [], count: 0 };
    throw e;
  }
}

// Invoices (list)
export async function listInvoices(params = {}, config = {}) {
  ensureTenant();
  try {
    const { signal, status, sort, ...restParams } = params || {};
    const finalParams = { ...restParams };
    finalParams.limit = Math.min(Number(restParams.limit || 50), 200);
    const normStatus = normalizeStatus(status);
    if (Array.isArray(normStatus)) finalParams.status = normStatus;
    if (typeof sort === 'object' && sort && sort.field && sort.dir) finalParams.sort = `${sort.field}:${sort.dir}`;
    const axiosConfig = { ...(config || {}), params: { ...(config?.params || {}), ...(finalParams || {}) }, ...(signal ? { signal } : {}) };
    const { data } = await api.get('/api/billing/invoices', axiosConfig);
    if (Array.isArray(data?.rows)) return data;
    const rows = Array.isArray(data) ? data : [];
    return { rows, count: rows.length };
  } catch (e) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return { rows: [], count: 0 };
    throw e;
  }
}

export async function listRecentInvoices(params = {}) {
  ensureTenant();
  const { data } = await api.get('/api/billing/invoices', { params: { limit: params.limit || 20, from: params.from, to: params.to, sort: 'created_at:desc' } });
  return Array.isArray(data?.rows) ? data : { rows: [], count: 0 };
}

export async function listRecentPayments(params = {}) {
  ensureTenant();
  const { data } = await api.get('/api/billing/payments', { params: { limit: params.limit || 20, from: params.from, to: params.to, sort: 'paid_at:desc' } });
  return Array.isArray(data?.rows) ? data : { rows: [], count: 0 };
}

export async function listAuditEvents(params = {}) {
  ensureTenant();
  try {
    const { data } = await api.get('/api/audit/events', { params });
    return Array.isArray(data?.events) ? data.events : [];
  } catch (e) {
    if (e?.response?.status === 404) return [];
    throw e;
  }
}

// Cash sessions helpers (client-side composition if backend route missing)
export async function getCurrentCashSessionForUser() {
  // No explicit endpoint; consider session enforced on payment POST. Return null to let UI prompt open.
  return null;
}

// People/admin helpers (lightweight - only if endpoints exist)
export async function listFamilies(params = {}) { ensureTenant(); const { data } = await api.get('/api/people/families', { params }); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }
export async function listStudents(params = {}) { ensureTenant(); const { data } = await api.get('/api/people/students', { params }); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }
export async function listTeachers(params = {}) { ensureTenant(); const { data } = await api.get('/api/people/teachers', { params }); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }
export async function listEmployees(params = {}) { ensureTenant(); const { data } = await api.get('/api/people/employees', { params }); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }

export async function listUsers(params = {}) { ensureTenant(); const { data } = await api.get('/api/users', { params }); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }
export async function listRoles() { ensureTenant(); const { data } = await api.get('/api/roles'); return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length }; }
export async function assignRole(userId, role) { ensureTenant(); const { data } = await api.post(`/api/users/${userId}/roles`, { role }); return data; }
export async function revokeRole(userId, role) { ensureTenant(); const { data } = await api.delete(`/api/users/${userId}/roles/${encodeURIComponent(role)}`); return data; }

export async function getAuditFeed(params = {}) { ensureTenant(); const { data } = await api.get('/api/audit/events', { params }); return Array.isArray(data?.events) ? data.events : []; }

// Settings
export async function listOrgPrefs() { ensureTenant(); const { data } = await api.get('/api/settings/org'); return data || {}; }
export async function updateOrgPrefs(payload) { ensureTenant(); const { data } = await api.put('/api/settings/org', payload); return data; }

export async function listGlobalPrefs() { ensureTenant(); const { data } = await api.get('/api/settings/global'); return data || {}; }
export async function updateGlobalPrefs(payload) { ensureTenant(); const { data } = await api.put('/api/settings/global', payload); return data; }

export async function listAudienceFlags() { ensureTenant(); const { data } = await api.get('/api/settings/flags'); return Array.isArray(data?.flags) ? data.flags : (data || []); }
export async function updateAudienceFlags(payload) { ensureTenant(); const { data } = await api.put('/api/settings/flags', payload); return data; }


