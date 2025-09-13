import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { InvoicingEntity } from '../models/index.js';

const r = Router();

r.get('/', requireAuth, requireSameSchool, async (req, res) => {
  const list = await InvoicingEntity.findAll({ where: { school_id: req.user.school_id } });
  res.json(list);
});

r.post('/', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const payload = { ...req.body, school_id: req.user.school_id };
  const created = await InvoicingEntity.create(payload);
  res.status(201).json(created);
});

r.put('/:id', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const entity = await InvoicingEntity.findByPk(id);
  if (!entity || Number(entity.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });
  await entity.update(req.body);
  res.json(entity);
});

r.delete('/:id', requireAuth, requireRoles('admin'), requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const entity = await InvoicingEntity.findByPk(id);
  if (!entity || Number(entity.school_id) !== Number(req.user.school_id)) return res.status(404).json({ message: 'Not found' });
  await entity.destroy();
  res.status(204).end();
});

export default r;
