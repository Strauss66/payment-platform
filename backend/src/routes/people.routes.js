import { Router } from 'express';
import { Op } from 'sequelize';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, withSchool } from '../middleware/tenancy.js';
import { Role, User, Student, Family } from '../models/index.js';

const r = Router();

function parsePaging(req){
  const limit = Math.min(Number(req.query.limit || 10), 100);
  const offset = Math.max(Number(req.query.offset || 0), 0);
  return { limit, offset };
}

// GET /api/people/students
r.get('/students', requireAuth, tenantScope, requireRoles('admin','super_admin','teacher'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const { limit, offset } = parsePaging(req);
    const q = String(req.query.q || '').trim();

    const whereBase = withSchool({ where: {} }, schoolId).where;
    const where = { ...whereBase };
    if (q) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${q}%` } },
        { last_name: { [Op.like]: `%${q}%` } },
      ];
    }
    const { rows, count } = await Student.findAndCountAll({ where, limit, offset, order: [['id','DESC']] });
    const mapped = rows.map(s => ({
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      grade: s.grade,
      enrollment_no: s.enrollment_no || null,
      status: s.status || 'active'
    }));
    return res.json({ rows: mapped, count });
  } catch (err) {
    console.error('list students failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// GET /api/people/teachers
r.get('/teachers', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const { limit, offset } = parsePaging(req);
    const q = String(req.query.q || '').trim();

    const include = [{ model: Role, as: 'roles', where: { key_name: 'teacher' }, through: { attributes: [] } }];
    const where = { school_id: schoolId };
    if (q) {
      where[Op.or] = [
        { username: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
      ];
    }
    const { rows, count } = await User.findAndCountAll({ where, include, limit, offset, order: [['id','DESC']] });
    const mapped = rows.map(u => ({ id: u.id, name: u.username, email: u.email, department: null }));
    return res.json({ rows: mapped, count });
  } catch (err) {
    console.error('list teachers failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// GET /api/people/families - list families (real table)
r.get('/families', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const { limit, offset } = parsePaging(req);
    const q = String(req.query.q || '').trim();

    const where = withSchool({ where: {} }, schoolId).where;
    if (q) {
      where[Op.or] = [
        { surname: { [Op.like]: `%${q}%` } },
        { code: { [Op.like]: `%${q}%` } }
      ];
    }
    const { rows, count } = await Family.findAndCountAll({ where, limit, offset, order: [['id','DESC']] });
    return res.json({ rows, count });
  } catch (err) {
    console.error('list families failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

// POST /api/people/families
r.post('/families', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const payload = {
      school_id: schoolId,
      code: String(req.body.code || '').trim(),
      surname: String(req.body.surname || '').trim(),
      created_by: req.user.id
    };
    if (!payload.code || !payload.surname) return res.status(400).json({ message: 'code and surname are required' });
    const created = await Family.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error('create family failed', err);
    const status = err?.status || 400;
    return res.status(status).json({ message: err?.message || 'Bad request' });
  }
});

// PUT /api/people/families/:id
r.put('/families/:id', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const fam = await Family.findByPk(id);
    if (!fam || Number(fam.school_id) !== Number(schoolId)) return res.status(404).json({ message: 'Not found' });
    const updates = {};
    if (req.body.code != null) updates.code = String(req.body.code).trim();
    if (req.body.surname != null) updates.surname = String(req.body.surname).trim();
    updates.updated_by = req.user.id;
    await fam.update(updates);
    return res.json(fam);
  } catch (err) {
    console.error('update family failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// DELETE /api/people/families/:id (hard delete MVP)
r.delete('/families/:id', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const fam = await Family.findByPk(id);
    if (!fam || Number(fam.school_id) !== Number(schoolId)) return res.status(404).json({ message: 'Not found' });
    await fam.destroy();
    return res.status(204).end();
  } catch (err) {
    console.error('delete family failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// --- Students CRUD (basic fields) ---
// POST /api/people/students
r.post('/students', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const payload = {
      school_id: schoolId,
      user_id: req.body.user_id || null,
      first_name: String(req.body.first_name || '').trim(),
      last_name: String(req.body.last_name || '').trim(),
      grade: req.body.grade || null,
      address: req.body.address || null,
      parent_guardian_name: req.body.parent_guardian_name || null
    };
    if (!payload.first_name || !payload.last_name) return res.status(400).json({ message: 'first_name and last_name are required' });
    const created = await Student.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error('create student failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// PUT /api/people/students/:id
r.put('/students/:id', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const s = await Student.findByPk(id);
    if (!s || Number(s.school_id) !== Number(schoolId)) return res.status(404).json({ message: 'Not found' });
    const updates = {};
    ['first_name','last_name','grade','address','parent_guardian_name'].forEach((k) => {
      if (req.body[k] != null) updates[k] = req.body[k];
    });
    await s.update(updates);
    return res.json(s);
  } catch (err) {
    console.error('update student failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// DELETE /api/people/students/:id
r.delete('/students/:id', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const id = Number(req.params.id);
    const s = await Student.findByPk(id);
    if (!s || Number(s.school_id) !== Number(schoolId)) return res.status(404).json({ message: 'Not found' });
    await s.destroy();
    return res.status(204).end();
  } catch (err) {
    console.error('delete student failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});
export default r;


