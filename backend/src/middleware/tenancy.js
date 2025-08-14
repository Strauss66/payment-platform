import { ROLES } from '../utils/roles.js';

export function requireSameSchool(req, res, next) {
  req.scope = { school_id: req.user.school_id };
  next();
}

export function tenantScope(req, res, next) {
  const user = req.user || {};
  const allowHeaderSwitch = String(process.env.TENANCY_ALLOW_HEADER_SWITCH || 'false').toLowerCase() === 'true';
  const isSuperAdmin = (user.roles || []).includes(ROLES.SUPER_ADMIN) || (user.roles || []).includes('super_admin');

  if (!isSuperAdmin) {
    req.context = { ...(req.context || {}), schoolId: user.school_id };
    return next();
  }

  // superadmin path
  let requested = null;
  const path = req.path || '';
  if (allowHeaderSwitch) {
    requested = req.header('X-School-Id') || req.query.schoolId || null;
  }
  // If switching not allowed, only /api/tenancy/schools* can be cross-school without explicit scoping
  if (!allowHeaderSwitch && !path.startsWith('/schools')) {
    if (!requested) {
      return res.status(400).json({ message: 'schoolId required for this operation' });
    }
  }
  req.context = { ...(req.context || {}), schoolId: requested ? Number(requested) : null };
  return next();
}

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