import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { CashRegister, CashSession, Payment } from '../models/index.js';

const r = Router();

r.get('/', requireAuth, requireSameSchool, async (req, res) => {
  const list = await CashRegister.findAll({ where: { school_id: req.user.school_id } });
  res.json(list);
});

r.post('/', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const payload = { ...req.body, school_id: req.user.school_id };
  const created = await CashRegister.create(payload);
  res.status(201).json(created);
});

r.put('/:id', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const reg = await CashRegister.findByPk(id);
  if (!reg || Number(reg.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });
  await reg.update(req.body);
  res.json(reg);
});

r.delete('/:id', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const reg = await CashRegister.findByPk(id);
  if (!reg || Number(reg.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });
  await reg.destroy();
  res.status(204).end();
});

// Open a cash session for a register
r.post('/:id/sessions/open', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  const registerId = Number(req.params.id);
  const reg = await CashRegister.findByPk(registerId);
  if (!reg || Number(reg.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });

  // Ensure user has no open session already for this register
  const existing = await CashSession.findOne({ where: { school_id: req.user.school_id, cash_register_id: registerId, opened_by: req.user.id, closed_at: null } });
  if (existing) return res.status(400).json({ message: 'You already have an open session for this register' });

  const created = await CashSession.create({
    school_id: req.user.school_id,
    cash_register_id: registerId,
    opened_by: req.user.id,
    opened_at: new Date(),
    totals_json: {}
  });
  res.status(201).json(created);
});

// Close a cash session with totals aggregation
r.post('/:id/sessions/:sessionId/close', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  const registerId = Number(req.params.id);
  const sessionId = Number(req.params.sessionId);
  const reg = await CashRegister.findByPk(registerId);
  if (!reg || Number(reg.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });

  const session = await CashSession.findByPk(sessionId);
  if (!session || session.closed_at || Number(session.school_id) !== Number(req.user.school_id) || Number(session.cash_register_id) !== registerId) {
    return res.status(400).json({ message: 'Invalid or already closed session' });
  }

  // Aggregate payments recorded by this cashier during the session window
  const [rows] = await CashSession.sequelize.query(
    `SELECT payment_method_id, SUM(amount) AS total
     FROM payments
     WHERE school_id = ? AND cashier_user_id = ? AND paid_at >= ? AND paid_at <= ?
     GROUP BY payment_method_id`,
    { replacements: [req.user.school_id, session.opened_by, session.opened_at, new Date()], type: CashSession.sequelize.QueryTypes.SELECT }
  );

  const totals = Array.isArray(rows) ? rows : [];
  await session.update({ closed_at: new Date(), totals_json: totals });
  res.json(session);
});

export default r;
