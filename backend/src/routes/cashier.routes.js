import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, requireSameSchool } from '../middleware/tenancy.js';
import { CashSession, Payment } from '../models/index.js';
import { generateZReport } from '../services/reports/zReport.service.js';
import { Op, fn, col, literal } from 'sequelize';

const r = Router();

// GET /api/billing/cash-sessions/:id/summary
r.get('/cash-sessions/:id/summary', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const params = z.object({ id: z.coerce.number().int().min(1) }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ code: 'VALIDATION_ERROR', details: params.error.errors });
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const session = await CashSession.findByPk(params.data.id);
  if (!session || Number(session.school_id) !== Number(schoolId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found' });

  // totals by method within session
  const rows = await Payment.findAll({
    attributes: ['payment_method_id', [fn('SUM', col('amount')), 'total'], [fn('COUNT', col('id')), 'count']],
    where: { school_id: schoolId, session_id: session.id },
    group: ['payment_method_id']
  });
  const methods = rows.map(r => ({ payment_method_id: r.payment_method_id, total: Number(r.get('total')), count: Number(r.get('count')) }));
  const expectedCash = methods.filter(m => isCashMethod(m.payment_method_id)).reduce((a,b)=>a+Number(b.total||0),0);
  const countedCash = Number(session?.totals_json?.counted_cash || 0);
  const variance = Number((countedCash - expectedCash).toFixed(2));
  return res.json({ session: { id: session.id, opened_at: session.opened_at, closed_at: session.closed_at }, methods, expectedCash, countedCash, variance });
});

// GET /api/billing/cash-sessions/:id/lines
r.get('/cash-sessions/:id/lines', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const params = z.object({ id: z.coerce.number().int().min(1), limit: z.coerce.number().int().min(1).max(500).default(200), offset: z.coerce.number().int().min(0).default(0) }).safeParse({ ...req.params, ...req.query });
  if (!params.success) return res.status(400).json({ code: 'VALIDATION_ERROR', details: params.error.errors });
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const session = await CashSession.findByPk(params.data.id);
  if (!session || Number(session.school_id) !== Number(schoolId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found' });

  const where = { school_id: schoolId, session_id: session.id };
  const { rows, count } = await Payment.findAndCountAll({ where, order: [['paid_at','DESC']], limit: params.data.limit, offset: params.data.offset });
  return res.json({ rows, count });
});

// POST /api/billing/cash-sessions/:id/close
r.post('/cash-sessions/:id/close', requireAuth, requireRoles('cashier','admin','super_admin'), tenantScope, requireSameSchool, async (req, res) => {
  const schema = z.object({ countedCash: z.coerce.number().nonnegative(), notes: z.string().max(500).optional() });
  const params = z.object({ id: z.coerce.number().int().min(1) }).safeParse(req.params);
  const body = schema.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ code: 'VALIDATION_ERROR', details: [...(params.error?.errors||[]), ...(body.error?.errors||[])] });
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const session = await CashSession.findByPk(params.data.id);
  if (!session || Number(session.school_id) !== Number(schoolId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found' });
  if (session.closed_at) return res.status(409).json({ code: 'ALREADY_CLOSED', message: 'Session already closed' });

  const payments = await Payment.findAll({ where: { school_id: schoolId, session_id: session.id } });
  const expectedCash = payments.filter(p => isCashMethod(p.payment_method_id)).reduce((a,p)=>a+Number(p.amount||0),0);
  const variance = Number((body.data.countedCash - expectedCash).toFixed(2));
  const totals = { ...(session.totals_json || {}), counted_cash: body.data.countedCash, variance, notes: body.data.notes || null };
  await session.update({ totals_json: totals, closed_at: new Date() });
  return res.json({ ok: true, variance });
});

// POST /api/billing/cash-sessions/:id/reopen
r.post('/cash-sessions/:id/reopen', requireAuth, requireRoles('admin','super_admin'), tenantScope, requireSameSchool, async (req, res) => {
  const params = z.object({ id: z.coerce.number().int().min(1) }).safeParse(req.params);
  const body = z.object({ memo: z.string().min(3).max(500) }).safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ code: 'VALIDATION_ERROR', details: [...(params.error?.errors||[]), ...(body.error?.errors||[])] });
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const session = await CashSession.findByPk(params.data.id);
  if (!session || Number(session.school_id) !== Number(schoolId)) return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found' });
  await session.update({ closed_at: null, totals_json: { ...(session.totals_json || {}), reopen_memo: body.data.memo, reopened_at: new Date() } });
  return res.json({ ok: true });
});

function isCashMethod(paymentMethodId) {
  // Placeholder: treat method id 1 as cash
  return String(paymentMethodId) === '1';
}

export default r;

// PDF endpoint (streaming)
r.get('/cash-sessions/:id/z-report', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const params = z.object({ id: z.coerce.number().int().min(1) }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ code: 'VALIDATION_ERROR', details: params.error.errors });
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="z-report-${params.data.id}.pdf"`);
  try {
    await generateZReport({ sessionId: params.data.id, schoolId, writeStream: res });
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ code: e?.code || 'INTERNAL_ERROR', message: e?.message || 'Failed to generate report' });
  }
});


