import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import tenancy from '../middleware/tenancy.js';
import { ROLES } from '../utils/roles.js';

const r = Router();

function parseIds(v){
  if (!v) return null; // all
  const arr = String(v).split(',').map(x => Number(x)).filter(n => Number.isFinite(n));
  return arr.length ? arr : null;
}

r.get('/overview', requireAuth, tenancy, async (req, res) => {
  try {
    const schoolIds = parseIds(req.query.schoolId);
    const isSuper = (req.user.roles || []).includes(ROLES.SUPER_ADMIN) || (req.user.roles || []).includes('super_admin');
    if (!isSuper && schoolIds && (!req.schoolId || schoolIds.some(id => id !== req.schoolId))) return res.status(403).json({ message: 'Forbidden' });
    return res.json({ totalSchools: 0, activeUsers30d: 0, outstandingInvoices: 0, paymentsMtd: 0, newSignups7d: 0 });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

r.get('/revenue', requireAuth, tenancy, async (req, res) => {
  try {
    const schoolIds = parseIds(req.query.schoolId);
    const isSuper = (req.user.roles || []).includes(ROLES.SUPER_ADMIN) || (req.user.roles || []).includes('super_admin');
    if (!isSuper && schoolIds && (!req.schoolId || schoolIds.some(id => id !== req.schoolId))) return res.status(403).json({ message: 'Forbidden' });
    return res.json({ revenue: [], ar: [] });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

r.get('/ar-aging', requireAuth, tenancy, async (req, res) => {
  try {
    const schoolIds = parseIds(req.query.schoolId);
    const isSuper = (req.user.roles || []).includes(ROLES.SUPER_ADMIN) || (req.user.roles || []).includes('super_admin');
    if (!isSuper && schoolIds && (!req.schoolId || schoolIds.some(id => id !== req.schoolId))) return res.status(403).json({ message: 'Forbidden' });
    return res.json({ buckets: [] });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;

