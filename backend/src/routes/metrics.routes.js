import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import tenancy from '../middleware/tenancy.js';
import { requireRoles } from '../middleware/rbac.js';
import { Invoice, Payment, Student } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import dayjs from 'dayjs';

const r = Router();

function startOfDay(d){ return dayjs(d).startOf('day').toDate(); }
function endOfDay(d){ return dayjs(d).endOf('day').toDate(); }

// GET /api/metrics/overview
// today_collections, pending_invoices, overdue_invoices
r.get('/overview', requireAuth, tenancy, requireRoles('admin','cashier','super_admin'), async (req, res) => {
  try {
    const schoolId = req.schoolId || req.context?.schoolId || req.user.school_id;
    if (!schoolId) return res.json({ today_collections: 0, pending_invoices: 0, overdue_invoices: 0 });
    const now = new Date();
    const [todaySum] = await Payment.sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE school_id = ? AND paid_at >= ? AND paid_at <= ?`,
      { replacements: [schoolId, startOfDay(now), endOfDay(now)] }
    );
    const today_collections = Number((Array.isArray(todaySum) ? todaySum[0]?.total : 0) || 0);

    const pending_invoices = await Invoice.count({
      where: { school_id: schoolId, balance: { [Op.gt]: 0 }, status: { [Op.in]: ['open','partial'] } }
    });
    const overdue_invoices = await Invoice.count({
      where: { school_id: schoolId, balance: { [Op.gt]: 0 }, due_date: { [Op.lt]: startOfDay(now) } }
    });
    return res.json({ today_collections, pending_invoices, overdue_invoices });
  } catch (e) {
    console.error('metrics/overview error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/metrics/payment-method-mix?from=&to=
r.get('/payment-method-mix', requireAuth, tenancy, requireRoles('admin','cashier','super_admin'), async (req, res) => {
  try {
    const schoolId = req.schoolId || req.context?.schoolId || req.user.school_id;
    if (!schoolId) return res.json([]);
    const from = req.query.from ? new Date(String(req.query.from)) : dayjs().subtract(30, 'day').toDate();
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();
    const [rows] = await Payment.sequelize.query(
      `SELECT payment_method_id, COALESCE(SUM(amount),0) AS total_amount
       FROM payments
       WHERE school_id = ? AND paid_at >= ? AND paid_at <= ?
       GROUP BY payment_method_id
       ORDER BY total_amount DESC`,
      { replacements: [schoolId, from, to] }
    );
    return res.json(Array.isArray(rows) ? rows : []);
  } catch (e) {
    console.error('metrics/payment-method-mix error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/metrics/attention-needed?limit=10
r.get('/attention-needed', requireAuth, tenancy, requireRoles('admin','cashier','super_admin'), async (req, res) => {
  try {
    const schoolId = req.schoolId || req.context?.schoolId || req.user.school_id;
    if (!schoolId) return res.json([]);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const rows = await Invoice.findAll({
      where: { school_id: schoolId, balance: { [Op.gt]: 0 }, due_date: { [Op.lt]: startOfDay(new Date()) } },
      include: [{ model: Student, as: 'student', required: false, attributes: ['id','first_name','last_name','grade'] }],
      order: [['due_date','ASC'], ['balance', 'DESC']],
      limit
    });
    const list = rows.map(inv => {
      const s = inv.student || {};
      return {
        id: inv.id,
        invoice_no: inv.number || inv.id,
        due_date: inv.due_date,
        balance: Number(inv.balance),
        student_id: s.id || null,
        student_name: s.first_name ? `${s.first_name} ${s.last_name||''}`.trim() : null
      };
    });
    return res.json(list);
  } catch (e) {
    console.error('metrics/attention-needed error', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;

