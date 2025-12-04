import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool, tenantScope } from '../middleware/tenancy.js';
import * as PaymentService from '../services/payment.services.js';
import { CashSession, Payment } from '../models/index.js';
import { Op } from 'sequelize';
import { z } from 'zod';

const r = Router();

// GET /api/billing/payments
// Returns { rows, count } with filters and pagination
r.get('/', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const SortRegex = /^(\w+):(asc|desc)$/i;
  const querySchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    method: z.string().optional(),
    cashierUserId: z.coerce.number().optional(),
    amountMin: z.coerce.number().optional(),
    amountMax: z.coerce.number().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    sort: z.string().regex(SortRegex).default('paid_at:desc')
  });

  try {
    const params = querySchema.parse(req.query);
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const where = { school_id: schoolId };
    if (params.from || params.to) {
      where.paid_at = {};
      if (params.from) where.paid_at[Op.gte] = new Date(params.from);
      if (params.to) where.paid_at[Op.lte] = new Date(params.to);
    }
    if (params.method) where.payment_method_id = params.method; // assuming id or code
    if (params.cashierUserId) where.cashier_user_id = params.cashierUserId;
    if (params.amountMin || params.amountMax) {
      where.amount = {};
      if (params.amountMin) where.amount[Op.gte] = Number(params.amountMin);
      if (params.amountMax) where.amount[Op.lte] = Number(params.amountMax);
    }

    const [sortField, sortDir] = params.sort.split(':');
    const result = await Payment.findAndCountAll({
      where,
      limit: params.limit,
      offset: params.offset,
      order: [[sortField, String(sortDir).toUpperCase()]]
    });
    return res.json({ rows: result.rows, count: result.count });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    }
    console.error('List payments failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// Record a payment and allocate to invoice items
// Map string payment methods to IDs when needed
const METHOD_MAP = { cash: 1, pos: 2, transfer: 3, online: 4 };

const postSchema = z.object({
  amount: z.coerce.number().positive(),
  payment_method_id: z.union([z.coerce.number().int().positive(), z.string().toLowerCase().transform((s)=>METHOD_MAP[s] || NaN)]).refine((v)=>Number.isFinite(v) && v > 0, { message: 'Invalid payment method' }),
  paid_at: z.string().datetime().optional(),
  note: z.string().max(255).optional(),
  session_id: z.coerce.number().int().positive().optional(),
  allocations: z.array(z.object({
    invoice_id: z.coerce.number().int().positive(),
    invoice_item_id: z.coerce.number().int().positive().optional(),
    amount: z.coerce.number().positive()
  })).min(1)
});

r.post('/', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const userId = req.user.id;

  try {
    const body = postSchema.parse(req.body);

    // Ensure session
    let sessionId = body.session_id ? Number(body.session_id) : null;
    if (sessionId) {
      const s = await CashSession.findByPk(sessionId);
      if (!s || Number(s.school_id) !== Number(schoolId) || s.closed_at) {
      return res.status(400).json({ message: 'Invalid or closed cash session' });
    }
  } else {
      const s = await CashSession.findOne({ where: { school_id: schoolId, opened_by: userId, closed_at: null } });
      if (!s) {
      return res.status(400).json({ message: 'Open cash session required' });
    }
      sessionId = s.id;
  }

    const result = await PaymentService.postPayment({
      school_id: schoolId,
      cashier_user_id: userId,
      session_id: sessionId,
      amount: body.amount,
      payment_method_id: body.payment_method_id,
      paid_at: body.paid_at,
      note: body.note,
      allocations: body.allocations
    });
    res.status(201).json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: e.errors });
    }
    const status = e?.status || 400;
    const payload = { code: e?.code || 'bad_request', message: e?.message || 'Failed to post payment' };
    return res.status(status).json(payload);
  }
});

export default r;