import { api } from './apiClient';

export async function listPayments(params = {}) {
  try {
    const { data } = await api.get('/api/billing/payments', { params });
    return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length };
  } catch (e) {
    if (e?.response?.status === 404) return { rows: [], count: 0 };
    throw e;
  }
}

export async function listInvoices(params = {}) {
  try {
    const { data } = await api.get('/api/billing/invoices', { params });
    return Array.isArray(data?.rows) ? data : { rows: data || [], count: (data || []).length };
  } catch (e) {
    if (e?.response?.status === 404) return { rows: [], count: 0 };
    throw e;
  }
}

export async function paymentsByMethodToday() {
  const from = new Date(); from.setHours(0,0,0,0);
  const to = new Date();
  const { rows } = await listPayments({ from: from.toISOString(), to: to.toISOString() });
  const agg = {};
  for (const p of rows) {
    const k = p.payment_method_id || 'unknown';
    agg[k] = (agg[k] || 0) + Number(p.amount || 0);
  }
  return agg;
}

export function computeAgingBuckets(invoices, asOfDate = new Date()) {
  const today = new Date(asOfDate); today.setHours(0,0,0,0);
  const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  const counts = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  for (const inv of invoices || []) {
    const due = new Date(inv.due_date || inv.due_at || inv.dueDate || today);
    due.setHours(0,0,0,0);
    const days = Math.max(0, Math.floor((today - due) / 86400000));
    const bal = Number(inv.balance ?? inv.remaining ?? 0);
    const bucket = days <= 30 ? '0-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '90+';
    buckets[bucket] += bal;
    counts[bucket] += 1;
  }
  return { buckets, counts };
}

export async function agingBuckets() {
  const { rows } = await listInvoices({ status: 'open' });
  return computeAgingBuckets(rows);
}

export function computeOnTimeRate(invoices) {
  // Define on-time as fully paid on or before due date.
  if (!Array.isArray(invoices) || invoices.length === 0) return 0;
  let total = 0, onTime = 0;
  for (const inv of invoices) {
    const due = inv.due_date || inv.due_at;
    const paidAt = inv.paid_at || inv.settled_at;
    const totalAmount = Number(inv.total || inv.amount || 0);
    const paidTotal = Number(inv.paid_total || inv.paid || 0);
    if (totalAmount <= 0) continue;
    total += 1;
    const fullyPaid = paidTotal >= totalAmount;
    const onOrBeforeDue = paidAt && new Date(paidAt).getTime() <= new Date(due).getTime();
    if (fullyPaid && onOrBeforeDue) onTime += 1;
  }
  return total > 0 ? onTime / total : 0;
}

export function computeDSO({ averageAR, netCreditSales, periodDays = 365 }) {
  const ar = Number(averageAR || 0);
  const sales = Number(netCreditSales || 0);
  if (sales <= 0) return 0;
  return (ar / sales) * Number(periodDays);
}


