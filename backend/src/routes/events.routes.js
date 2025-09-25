import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, requireSameSchool, withSchool } from '../middleware/tenancy.js';
import { Event } from '../models/index.js';
import { Op } from 'sequelize';
import { z } from 'zod';

const r = Router();

// GET /api/events?from&to&calendarId
r.get('/', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const schema = z.object({ from: z.string().datetime(), to: z.string().datetime(), calendarId: z.coerce.number().int().positive().optional() });
  try {
    const { from, to, calendarId } = schema.parse({ ...req.query });
    const where = withSchool({ where: { starts_at: { [Op.lte]: new Date(to) } } }, schoolId).where;
    if (calendarId) where.calendar_id = calendarId;
    // Simple overlap: event starts before 'to' and (ends null or ends after 'from')
    where[Op.and] = [
      { starts_at: { [Op.lte]: new Date(to) } },
      { [Op.or]: [ { ends_at: null }, { ends_at: { [Op.gte]: new Date(from) } } ] }
    ];
    const rows = await Event.findAll({ where, order: [['starts_at','ASC'], ['id','ASC']] });
    const mapped = rows.map(e => ({
      id: e.id,
      calendarId: e.calendar_id,
      title: e.title,
      description: e.description,
      startsAt: e.starts_at instanceof Date ? e.starts_at.toISOString() : e.starts_at,
      endsAt: e.ends_at instanceof Date ? e.ends_at.toISOString() : (e.ends_at == null ? null : e.ends_at),
      allDay: !!e.all_day,
      sourceType: e.source_type,
      announcementId: e.announcement_id ?? null,
      location: e.location || null
    }));
    res.json(mapped);
  } catch (e) {
    res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message });
  }
});

// POST /api/events (manual)
r.post('/', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const schema = z.object({
    calendarId: z.coerce.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().nullable().optional(),
    allDay: z.boolean().optional(),
    location: z.string().max(200).nullable().optional()
  });
  try {
    const p = schema.parse(req.body || {});
    const created = await Event.create({ school_id: schoolId, calendar_id: p.calendarId, title: p.title, description: p.description || null, starts_at: new Date(p.startsAt), ends_at: p.endsAt ? new Date(p.endsAt) : null, all_day: p.allDay ? 1 : 0, location: p.location || null, source_type: 'manual' });
    res.status(201).json({ id: created.id });
  } catch (e) { res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message }); }
});

// PUT /api/events/:id
r.put('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const id = Number(req.params.id);
  const row = await Event.findOne({ where: { id, school_id: schoolId } });
  if (!row) return res.status(404).json({ code: 'NOT_FOUND' });
  if (row.source_type !== 'manual') return res.status(400).json({ code: 'IMMUTABLE_EVENT', message: 'Linked events are managed by their source' });
  const schema = z.object({ title: z.string().min(1).optional(), description: z.string().nullable().optional(), startsAt: z.string().datetime().optional(), endsAt: z.string().datetime().nullable().optional(), allDay: z.boolean().optional(), location: z.string().max(200).nullable().optional() });
  try {
    const p = schema.parse(req.body || {});
    const updates = { ...('title' in p ? { title: p.title } : {}), ...('description' in p ? { description: p.description } : {}), ...('startsAt' in p ? { starts_at: new Date(p.startsAt) } : {}), ...('endsAt' in p ? { ends_at: p.endsAt ? new Date(p.endsAt) : null } : {}), ...('allDay' in p ? { all_day: p.allDay ? 1 : 0 } : {}), ...('location' in p ? { location: p.location || null } : {}) };
    await row.update(updates);
    res.json({ ok: true, id });
  } catch (e) { res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message }); }
});

// DELETE /api/events/:id
r.delete('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  const schoolId = req.context?.schoolId ?? req.user.school_id;
  const id = Number(req.params.id);
  const row = await Event.findOne({ where: { id, school_id: schoolId } });
  if (!row) return res.status(404).json({ code: 'NOT_FOUND' });
  if (row.source_type !== 'manual') return res.status(400).json({ code: 'IMMUTABLE_EVENT', message: 'Linked events are managed by their source' });
  await row.destroy();
  res.json({ ok: true, id });
});

export default r;


