/**
 * Announcements routes
 * - Create, update, list, delete announcements for a school
 * - Enforces tenancy and roles via middleware
 * - Signs media keys for clients; deletes S3 media on hard delete (best effort)
 */
import { Router } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, requireSameSchool, withSchool } from '../middleware/tenancy.js';
import { Announcement, Student, Class } from '../models/index.js';
import { validateAnnouncement, computeStatus, audienceSummary } from '../validators/announcementValidator.js';
import { emitAudit } from '../services/audit.service.js';
import { inboundDtoToModel, modelToOutboundDto } from '../mappers/announcementMapper.js';
import { signKeys } from '../utils/mediaSigner.js';
import { upsertEventFromAnnouncement, deleteEventByAnnouncementId } from '../services/calendar.service.js';
import { deleteAnnouncementKeys } from "../utils/mediaDelete.js";

const r = Router();

const upsertSchema = z.any();

// mapSignedMedia is imported from utils; no local helpers needed

// POST /api/announcements - create announcement
r.post('/', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    // Support audienceRoles alias for roleKeys for validation
    const body = { ...req.body };
    if (!body.roleKeys && Array.isArray(body.audienceRoles)) body.roleKeys = body.audienceRoles;

    let parsed;
    try {
      parsed = validateAnnouncement(body);
    } catch (e) {
      const details = e?.issues || e?.errors;
      if (details) return res.status(400).json({ code: 'VALIDATION_ERROR', details });
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message || 'Invalid announcement payload' });
    }

    // Validate referenced IDs belong to this school (students) and exist (classes)
    if (Array.isArray(parsed.studentIds) && parsed.studentIds.length) {
      const count = await Student.count({ where: { id: parsed.studentIds, school_id: schoolId } });
      if (count !== parsed.studentIds.length) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid studentIds for this school' });
      }
    }
    if (Array.isArray(parsed.classIds) && parsed.classIds.length) {
      const count = await Class.count({ where: { id: parsed.classIds } });
      if (count !== parsed.classIds.length) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid classIds' });
      }
    }

    let modelPayload;
    try {
      modelPayload = inboundDtoToModel(parsed);
    } catch (e) {
      return res.status(400).json({ code: e.code || 'VALIDATION_ERROR', message: e?.message || 'Invalid announcement payload' });
    }

    const payload = { ...modelPayload, school_id: schoolId, created_by: req.user.id, updated_by: req.user.id };

    const created = await Announcement.create(payload);
    await emitAudit({ schoolId, actorUserId: req.user.id, entity: 'announcement', entityId: created.id, action: 'create', before: null, after: created.toJSON() });
    // Calendar sync
    try {
      // pass addToCalendar flag from request to helper via a decorated object
      const annWithFlag = { ...created.get({ plain: true }), addToCalendar: !!body.addToCalendar };
      await upsertEventFromAnnouncement(annWithFlag);
    } catch (e) { console.warn('[announcements:create] calendar sync failed', e?.message || e); }
    let dto = modelToOutboundDto(created);
    if (Array.isArray(dto.imageKeys) && dto.imageKeys.length) {
      dto.imageSignedUrls = await signKeys(dto.imageKeys, 1800);
    }
    return res.status(201).json(dto);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    console.error('create announcement failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// PUT /api/announcements/:id - update announcement (no media deletion here)
r.put('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const body = { ...req.body };
    if (!body.roleKeys && Array.isArray(body.audienceRoles)) body.roleKeys = body.audienceRoles;

    let parsed;
    try {
      parsed = validateAnnouncement(body);
    } catch (e) {
      const details = e?.issues || e?.errors;
      if (details) return res.status(400).json({ code: 'VALIDATION_ERROR', details });
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: e?.message || 'Invalid announcement payload' });
    }

    const ann = await Announcement.findByPk(id);
    if (!ann || Number(ann.school_id) !== Number(schoolId)) return res.status(404).json({ code: 'NOT_FOUND' });
    const before = ann.toJSON();

    // Validate referenced IDs belong to this school (students) and exist (classes)
    if (Array.isArray(parsed.studentIds) && parsed.studentIds.length) {
      const count = await Student.count({ where: { id: parsed.studentIds, school_id: schoolId } });
      if (count !== parsed.studentIds.length) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid studentIds for this school' });
      }
    }
    if (Array.isArray(parsed.classIds) && parsed.classIds.length) {
      const count = await Class.count({ where: { id: parsed.classIds } });
      if (count !== parsed.classIds.length) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid classIds' });
      }
    }

    let updates;
    try {
      updates = { ...inboundDtoToModel(parsed), updated_by: req.user.id };
    } catch (e) {
      return res.status(400).json({ code: e.code || 'VALIDATION_ERROR', message: e?.message || 'Invalid announcement payload' });
    }
    await ann.update(updates);
    await emitAudit({ schoolId, actorUserId: req.user.id, entity: 'announcement', entityId: ann.id, action: 'update', before, after: ann.toJSON() });
    // Calendar sync: create/update or delete depending on flags
    try {
      const annWithFlag = { ...ann.get({ plain: true }), addToCalendar: !!body.addToCalendar };
      const shouldHave = (annWithFlag.category === 'events') || !!annWithFlag.addToCalendar;
      if (shouldHave) await upsertEventFromAnnouncement(annWithFlag);
      else await deleteEventByAnnouncementId(ann.id, schoolId);
    } catch (e) { console.warn('[announcements:update] calendar sync failed', e?.message || e); }
    let dto = modelToOutboundDto(ann);
    if (Array.isArray(dto.imageKeys) && dto.imageKeys.length) {
      dto.imageSignedUrls = await signKeys(dto.imageKeys, 1800);
    }
    return res.json(dto);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    console.error('update announcement failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// DELETE /api/announcements/:id - hard delete; best-effort media cleanup under announcements prefix
r.delete('/:id', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const row = await Announcement.findOne({ where: { id, school_id: schoolId } });
    if (!row) return res.status(404).json({ code: 'NOT_FOUND' });

    const before = row.toJSON();
    // capture keys before destroying
    const json = row.get({ plain: true });
    const keys = Array.isArray(json.image_keys) ? json.image_keys : [];

    await row.destroy();
    await emitAudit({ schoolId, actorUserId: req.user.id, entity: 'announcement', entityId: id, action: 'delete', before, after: null });
    try { await deleteEventByAnnouncementId(id, schoolId); } catch (e) { console.warn('[announcements:delete] event cleanup failed', e?.message || e); }

    // best-effort media delete (can be toggled off)
    if (process.env.DELETE_MEDIA_ON_ANNOUNCEMENT_DELETE !== 'false' && keys.length) {
      if (process.env.DEBUG) {
        console.debug('[ANN:delete] attempting media delete', { id, schoolId, keysCount: keys.length, sample: keys.slice(0,3) });
      }
      const { deleted, errors } = await deleteAnnouncementKeys(keys, schoolId);
      if (errors?.length) {
        console.warn('[announcements:delete-media] errors', { id, schoolId, errors });
      }
      return res.json({ ok: true, id, mediaDeleted: deleted, mediaErrors: errors?.length || 0 });
    }
    return res.json({ ok: true, id, mediaDeleted: 0, mediaErrors: 0 });
  } catch (err) {
    console.error('delete announcement failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// GET /api/announcements - admin index for tenant (includes signed media URLs)
r.get('/', requireAuth, tenantScope, requireSameSchool, requireRoles('admin','super_admin','cashier','teacher'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const where = withSchool({ where: {} }, schoolId).where;
    const { rows, count } = await Announcement.findAndCountAll({ where, limit, offset, order: [['starts_at','DESC'], ['id','DESC']] });
    const now = new Date();
    const dtos = rows.map(r=>{
      const dto = modelToOutboundDto(r);
      return { ...dto, status: computeStatus(now, dto.startsAt, dto.endsAt), audienceSummary: audienceSummary(dto) };
    });
    const mapped = await Promise.all(dtos.map(async d => {
      if (Array.isArray(d.imageKeys) && d.imageKeys.length) {
        d.imageSignedUrls = await signKeys(d.imageKeys, 1800);
      }
      return d;
    }));
    if (process.env.DEBUG && mapped[0]) {
      const first = mapped[0];
      console.debug('[ANN:list:firstRow]', { id: first.id, imageKeysCount: Array.isArray(first.imageKeys) ? first.imageKeys.length : 0 });
    }
    return res.json({ rows: mapped, count });
  } catch (err) {
    console.error('list announcements failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// GET /api/announcements/visible - visible for current user (active + upcoming 14 days)
r.get('/visible', requireAuth, tenantScope, async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const limit = Math.min(Number(req.query.limit || 50), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const nowUtc = new Date(); // Stored as UTC in DB; comparisons use UTC
    const upcomingCutoff = new Date(nowUtc.getTime() + 14*24*60*60*1000);

    const schoolWhere = withSchool({ where: {} }, schoolId).where;
    const timeWhere = {
      [Op.or]: [
        // Active: starts_at <= now AND (ends_at IS NULL OR ends_at >= now)
        {
          [Op.and]: [
            { starts_at: { [Op.lte]: nowUtc } },
            { [Op.or]: [ { ends_at: null }, { ends_at: { [Op.gte]: nowUtc } } ] }
          ]
        },
        // Upcoming within 14 days: now < starts_at <= upcomingCutoff
        {
          [Op.and]: [
            { starts_at: { [Op.gt]: nowUtc } },
            { starts_at: { [Op.lte]: upcomingCutoff } }
          ]
        }
      ]
    };
    const where = { [Op.and]: [ schoolWhere, timeWhere ] };

    const { rows: all, count } = await Announcement.findAndCountAll({
      where,
      order: [['starts_at','ASC'], ['created_at','DESC']],
      limit,
      offset
    });

    // Role-based filtering
    const roles = req.user.roles || [];
    const isSuper = roles.includes('super_admin');

    const isTeacher = roles.includes('teacher');
    const isParent = roles.includes('student_parent') || roles.includes('parent');

    const userCtx = req.context || {};
    const userClassIds = Array.isArray(userCtx.classIds) ? userCtx.classIds : [];
    const userStudentId = userCtx.studentId ?? null; // parent or student portals can set this
    const userSection = userCtx.section ?? null; // 'preschool'|'elementary'|'middle'|'high'

    function matches(a){
      // time filtering handled in SQL
      // union semantics: visible if ANY selector matches this viewer
      if (a.audience_type === 'school') return true;

      // Sections
      if (a.audience_type === 'section' && userSection && Array.isArray(a.sections) && a.sections.includes(userSection)) return true;

      // Classes
      if (a.audience_type === 'class' && Array.isArray(a.class_ids) && a.class_ids.some(id => userClassIds.includes(id))) return true;

      // Students (direct-to-student)
      if (a.audience_type === 'student' && userStudentId && Array.isArray(a.student_ids) && a.student_ids.includes(userStudentId)) return true;

      // Role-based targeting (teachers/parents)
      const rk = Array.isArray(a.role_keys) ? a.role_keys : [];
      if (isTeacher && rk.includes('teachers')) return true;
      if (isParent && rk.includes('parents')) return true;

      return false;
    }

    const visibleRows = isSuper ? all : all.filter(a => matches(a));
    // Ensure uniqueness by id (viewer could match multiple selectors)
    const seen = new Set();
    const uniqueRows = [];
    for (const a of visibleRows) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      uniqueRows.push(a);
    }

    // Map to DTOs
    let dtos = uniqueRows.map(a => {
      const dto = modelToOutboundDto(a);
      return { ...dto, status: computeStatus(nowUtc, dto.startsAt, dto.endsAt), audienceSummary: audienceSummary(dto) };
    });
    let mapped = await Promise.all(dtos.map(async d => {
      if (Array.isArray(d.imageKeys) && d.imageKeys.length) {
        d.imageSignedUrls = await signKeys(d.imageKeys, 1800);
      }
      return d;
    }));

    // Stable sort: startsAt ASC, then createdAt DESC
    mapped.sort((a,b)=>{
      const s = new Date(a.startsAt) - new Date(b.startsAt);
      if (s !== 0) return s;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const nextOffset = offset + all.length < count ? offset + all.length : null;
    return res.json({ rows: mapped, count, nextOffset });
  } catch (err) {
    console.error('visible announcements failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

export default r;
