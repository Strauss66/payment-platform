import { Router } from 'express';
import { Op } from 'sequelize';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope, withSchool } from '../middleware/tenancy.js';
import { Role, User, UserRole, Student } from '../models/index.js';

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

// GET /api/people/families
// Note: No explicit Family model; approximate by grouping students by parent_guardian_name
r.get('/families', requireAuth, tenantScope, requireRoles('admin','super_admin'), async (req, res) => {
  try {
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const { limit, offset } = parsePaging(req);
    const q = String(req.query.q || '').trim();

    const whereBase = withSchool({ where: {} }, schoolId).where;
    const where = { ...whereBase };
    if (q) {
      where.parent_guardian_name = { [Op.like]: `%${q}%` };
    }
    const { rows, count } = await Student.findAndCountAll({ where, limit, offset, order: [['id','DESC']] });
    // naive grouping
    const groups = new Map();
    for (const s of rows) {
      const key = s.parent_guardian_name || 'Unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    }
    let i = 1;
    const mapped = Array.from(groups.entries()).map(([guardian, list]) => ({
      id: i++,
      code: guardian,
      guardians: [{ name: guardian }],
      students: list.map(x => ({ id: x.id, name: `${x.first_name || ''} ${x.last_name || ''}`.trim() })),
      students_count: list.length
    }));
    return res.json({ rows: mapped, count: mapped.length });
  } catch (err) {
    console.error('list families failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

export default r;


