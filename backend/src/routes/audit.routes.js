import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { z } from 'zod';
import { listEvents } from '../services/audit.service.js';

const r = Router();

// GET /api/audit/events?limit=20&from&to&type[]=payments&type[]=invoices&type[]=cash_sessions
// Composition query across payments, invoices, cash_sessions; always scoped by school_id
r.get('/events', requireAuth, requireSameSchool, async (req, res) => {
  const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: z.union([z.string(), z.array(z.string())]).optional()
      .transform((val) => {
        if (!val) return undefined;
        if (Array.isArray(val)) return val;
        return String(val).split(',').map((s) => s.trim()).filter(Boolean);
      })
  });

  try {
    const params = querySchema.parse(req.query);
    const schoolId = req.context?.schoolId ?? req.user.school_id;
    const events = await listEvents({ schoolId, limit: params.limit, from: params.from, to: params.to, types: params.type });
    return res.json({ events });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    }
    console.error('Audit events failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

export default r;

 
