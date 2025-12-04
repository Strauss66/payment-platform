import { api } from './apiClient';

export async function getOverview(params){ const { data } = await api.get('/api/metrics/overview', { params }); return data; }
export async function getOverviewMetrics(params){ return await getOverview(params); }
export async function getPaymentMethodMix(params){ const { data } = await api.get('/api/metrics/payment-method-mix', { params }); return data; }
export async function getAttentionNeeded(params){ const { data } = await api.get('/api/metrics/attention-needed', { params }); return data; }
export async function getRevenue(params){ const { data } = await api.get('/api/metrics/revenue', { params }); return data; }
export async function getARAging(params){ const { data } = await api.get('/api/metrics/ar-aging', { params }); return data; }
export async function getTopSchools(params){ const { data } = await api.get('/api/schools/top', { params }); return data; }

