import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import tenancy from '../middleware/tenancy.js';

const r = Router();

r.get('/', requireAuth, tenancy, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ results: [] });
    // Placeholder: Wire real search later
    return res.json({ results: [] });
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;

