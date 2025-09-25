import { ROLES } from '../utils/roles.js';
import { User, School } from '../models/index.js';

// Default tenancy middleware: sets req.schoolId and mirrors to req.context.schoolId
export default async function tenancy(req, res, next) {
  try {
    // If auth hasn't run yet, defer tenancy checks
    if (!req.user) {
      req.context = { ...(req.context || {}) };
      return next();
    }

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

    // Non-super: force to a concrete school id
    let forced = user.defaultSchoolId || user.school_id || null;

    // Fallback: if missing, derive from DB (default school or single mapping)
    if (!forced && user.id) {
      const dbUser = await User.findByPk(user.id, {
        include: [
          { model: School, as: 'defaultSchool' },
          { model: School, as: 'schools', through: { attributes: [] } }
        ]
      });
      if (dbUser) {
        const schools = Array.isArray(dbUser.schools) ? dbUser.schools : [];
        forced = dbUser.default_school_id || (schools.length === 1 ? schools[0].id : null) || dbUser.school_id || null;
        if (forced) {
          // Reflect into req.user so downstream sees the context
          req.user.defaultSchoolId = forced;
        }
      }
    }

    if (!forced) {
      return res.status(400).json({ message: 'No default school assigned to this account.' });
    }

    req.schoolId = Number(forced);
    req.context = { ...(req.context || {}), schoolId: req.schoolId };
    return next();
  } catch (err) {
    return next(err);
  }
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