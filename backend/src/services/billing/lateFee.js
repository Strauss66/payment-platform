// Compute late fee for an invoice as of a given date using decimal-safe integer math (cents)
// Rules (defaults):
// - 10% initial fee once the invoice is late (after due_date)
// - 1.5% monthly compounding on the outstanding (base + accrued late fees) for each full 30-day period late
// Params:
//   invoice: { due_date: string|Date, total?: number, paid_total?: number, balance?: number }
//   asOf: string|Date
//   prefs: { initialPct?: number, monthlyCompPct?: number }
// Returns: number (late fee in currency units, rounded to cents)

export function computeLateFee(invoice, asOf, prefs = {}) {
  if (!invoice) return 0;
  const initialPct = normalizePercent(prefs.initialPct, 0.10); // 10%
  const monthlyCompPct = normalizePercent(prefs.monthlyCompPct, 0.015); // 1.5%

  const due = normalizeDate(invoice.due_date);
  const asOfDate = normalizeDate(asOf);
  // If asOf is on or before due date => no fee
  if (!due || !asOfDate || asOfDate <= due) return 0;

  const baseCents = inferBaseCents(invoice);
  if (baseCents <= 0) return 0;

  const daysLate = diffDays(asOfDate, due);
  // Initial 10% once late
  let principalCents = baseCents + roundCents(baseCents * initialPct);

  // Number of full 30-day periods late
  const monthsLate = Math.floor(daysLate / 30);
  for (let i = 0; i < monthsLate; i++) {
    principalCents = principalCents + roundCents(principalCents * monthlyCompPct);
  }

  const lateFeeCents = principalCents - baseCents;
  return lateFeeCents / 100;
}

function normalizePercent(p, fallback) {
  if (typeof p === 'number' && !Number.isNaN(p) && p >= 0) return p;
  return fallback;
}

function normalizeDate(d) {
  if (!d) return null;
  if (d instanceof Date) return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (typeof d === 'string') {
    // Treat YYYY-MM-DD as UTC date start to avoid TZ drift
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(`${d}T00:00:00Z`);
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }
  return null;
}

function diffDays(a, b) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY));
}

function roundCents(valueNumber) {
  // valueNumber is in cents when used with integers, but here we may multiply by percent
  // so we round to the nearest cent (integer)
  return Math.round(valueNumber);
}

function inferBaseCents(invoice) {
  const hasBalance = typeof invoice.balance === 'number' && !Number.isNaN(invoice.balance);
  const base = hasBalance
    ? invoice.balance
    : (Number(invoice.total || 0) - Number(invoice.paid_total || 0));
  return Math.max(0, Math.round(base * 100));
}

export default { computeLateFee };


