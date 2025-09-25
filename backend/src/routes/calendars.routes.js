import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, requireSameSchool, withSchool } from '../middleware/tenancy.js';
import { Calendar, Event } from '../models/index.js';
import { z } from 'zod';

const r = Router();

// POST /api/calendars
r.post('/', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const schema = z.object({ name: z.string().min(1), color: z.string().max(16).nullable().optional(), visibility: z.enum(['school','private']).optional() });
  try {
    const { name, color, visibility } = schema.parse(req.body || {});
    const created = await Calendar.create({ school_id: schoolId, name, color: color || null, visibility: visibility || 'school', created_by: req.user.id, updated_by: req.user.id });
    res.status(201).json({ id: created.id, schoolId, name: created.name, color: created.color, visibility: created.visibility });
  } catch (e) { res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message }); }
});

// GET /api/calendars
r.get('/', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const where = withSchool({ where: { visibility: 'school' } }, schoolId).where;
  const rows = await Calendar.findAll({ where, order: [['name','ASC']] });
  res.json(rows.map(c => ({ id: c.id, schoolId, name: c.name, color: c.color, visibility: c.visibility })));
});

// PUT /api/calendars/:id
r.put('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const id = Number(req.params.id);
  const row = await Calendar.findOne({ where: { id, school_id: schoolId } });
  if (!row) return res.status(404).json({ code: 'NOT_FOUND' });
  const schema = z.object({ name: z.string().min(1).optional(), color: z.string().max(16).nullable().optional(), visibility: z.enum(['school','private']).optional() });
  try {
    const updates = schema.parse(req.body || {});
    await row.update({ ...updates, updated_by: req.user.id });
    res.json({ id: row.id, schoolId, name: row.name, color: row.color, visibility: row.visibility });
  } catch (e) { res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message }); }
});

// DELETE /api/calendars/:id (cascade events)
r.delete('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const id = Number(req.params.id);
  const row = await Calendar.findOne({ where: { id, school_id: schoolId } });
  if (!row) return res.status(404).json({ code: 'NOT_FOUND' });
  await Event.destroy({ where: { school_id: schoolId, calendar_id: id } });
  await row.destroy();
  res.json({ ok: true, id });
});

export default r;


