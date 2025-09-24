import { ROLES } from '../utils/roles.js';

// Default tenancy middleware: sets req.schoolId and mirrors to req.context.schoolId
export default function tenancy(req, res, next) {
  const user = req.user || {};
  const hdr = req.header('X-School-Id');
  const roles = user.roles || [];
  const isSuper = roles.includes(ROLES.SUPER_ADMIN) || roles.includes('super_admin');

  if (isSuper) {
    const sid = hdr || user.defaultSchoolId || null;
    req.schoolId = sid ? Number(sid) : null;
    req.context = { ...(req.context || {}), schoolId: req.schoolId };
    return next();
  }

  const forced = user.defaultSchoolId || user.school_id || null;
  if (!forced) {
    return res.status(400).json({ message: 'No default school assigned to this account.' });
  }
  req.schoolId = Number(forced);
  req.context = { ...(req.context || {}), schoolId: req.schoolId };
  return next();
}

export function requireSameSchool(req, res, next) {
  const forced = (req.context && req.context.schoolId) || req.user.defaultSchoolId || req.user.school_id;
  if (!forced) {
    return res.status(400).json({ message: 'User has no school context' });
  }
  req.scope = { school_id: Number(forced) };
  next();
}

export function tenantScope(req, res, next) { return tenancy(req, res, next); }

export function withSchool(query, schoolId) {
  const base = query || {};
  const where = { ...(base.where || {}) };
  if (schoolId != null) {
    if (where.school_id != null && where.school_id !== schoolId) {
      const err = new Error('Forbidden scope change');
      err.status = 403;
      throw err;
    }
    where.school_id = schoolId;
  }
  return { ...base, where };
}