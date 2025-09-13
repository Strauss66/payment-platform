import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool, tenantScope } from '../middleware/tenancy.js';
import * as InvoiceService from '../services/invoice.services.js';
import { Invoice, InvoiceItem, Student } from '../models/index.js';
import { Op } from 'sequelize';
import { z } from 'zod';

const r = Router();

// Helpers
const allowedStatuses = ['open','partial','paid','void'];
function coerceStatus(val) {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.filter((s) => allowedStatuses.includes(s));
  return String(val)
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter((s) => allowedStatuses.includes(s));
}
function clampLimit(n, min = 1, max = 500) {
  const num = Number(n);
  if (!Number.isFinite(num)) return Math.min(Math.max(50, min), max);
  return Math.min(Math.max(num, min), max);
}

// GET /api/billing/invoices
// Returns { rows, count } with filters and pagination
r.get('/', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const SortRegex = /^(\w+):(asc|desc)$/i;
  const querySchema = z.object({
    status: z.any().optional().transform((val) => coerceStatus(val)),
    dueFrom: z.string().datetime().optional(),
    dueTo: z.string().datetime().optional(),
    q: z.string().optional(),
    levelId: z.coerce.number().optional(),
    studentId: z.coerce.number().optional(),
    limit: z.coerce.number().int().min(1).max(500).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    sort: z.string().regex(SortRegex).default('due_date:asc')
  });

  try {
    if (process.env.NODE_ENV !== 'production') {
      try { console.debug('Invoices list query', req.query); } catch {}
    }
    const params = querySchema.parse(req.query);
    // tenant scope, allow super_admin override via req.context.schoolId if present
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const where = { school_id: schoolId };

    if (params.status && params.status.length) {
      where.status = { [Op.in]: params.status };
    }
    if (params.studentId) {
      where.student_id = params.studentId;
    }
    if (params.dueFrom || params.dueTo) {
      where.due_date = {};
      if (params.dueFrom) where.due_date[Op.gte] = new Date(params.dueFrom);
      if (params.dueTo) where.due_date[Op.lte] = new Date(params.dueTo);
    }
    // q search across invoice id and student name
    let include = [{ model: InvoiceItem, as: 'items', required: false }];
    if (params.q) {
      const idNum = Number(params.q);
      if (!Number.isNaN(idNum)) {
        where.id = idNum;
      } else {
        include.push({
          model: Student,
          as: 'student',
          required: false,
          attributes: ['id', 'first_name', 'last_name'],
          where: {
            // simple LIKE match on names
            [Op.or]: [
              { first_name: { [Op.like]: `%${params.q}%` } },
              { last_name: { [Op.like]: `%${params.q}%` } }
            ]
          }
        });
      }
    }

    const [sortField, sortDir] = params.sort.split(':');

    const result = await Invoice.findAndCountAll({
      where,
      include,
      limit: clampLimit(params.limit),
      offset: params.offset,
      order: [[sortField, String(sortDir).toUpperCase()]]
    });

    return res.json({ rows: result.rows, count: result.count });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    }
    console.error('List invoices failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// Issue a new invoice with line items
r.post('/', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  try {
    const result = await InvoiceService.createInvoice({
      school_id: req.user.school_id,
      ...req.body
    });
    res.status(201).json(result);
  } catch (e) {
    const status = e?.status || 400;
    const payload = { code: e?.code || 'bad_request', message: e?.message || 'Failed to create invoice' };
    return res.status(status).json(payload);
  }
});

// Get student invoices (open)
r.get('/student/:studentId', requireAuth, requireSameSchool, async (req, res) => {
  const list = await InvoiceService.getStudentInvoices(req.user.school_id, req.params.studentId);
  res.json(list);
});

// Get invoice by id with computed late fee
r.get('/:id', requireAuth, requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const list = await InvoiceService.getStudentInvoices(req.user.school_id, req.query.student_id);
  const found = list.find(i => Number(i.id) === id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  res.json(found);
});

export default r;