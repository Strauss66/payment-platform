import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { z } from 'zod';
import { sequelize } from '../config/db.js';
import { Invoice } from '../models/index.js';
import { computeLateFee } from '../services/billing/lateFee.js';

const r = Router();

// POST /api/billing/late-fees/run?asOf=
// Admin-only; computes late fees as of a date and stores them as adjustments
r.post('/run', requireAuth, requireRoles('admin','super_admin'), requireSameSchool, async (req, res) => {
  const schema = z.object({ asOf: z.string().datetime().optional() });
  try {
    const { asOf } = schema.parse(req.query);
    const asOfDate = asOf ? new Date(asOf) : new Date();

    // Idempotent guard by month/school: if a run exists for the same YYYY-MM and school, short-circuit
    const yearMonth = asOfDate.toISOString().slice(0,7);
    const [existing] = await sequelize.query(
      'SELECT id FROM late_fee_runs WHERE school_id = :schoolId AND year_month = :ym LIMIT 1',
      { replacements: { schoolId: req.user.school_id, ym: yearMonth } }
    );
    if (Array.isArray(existing) && existing.length) {
      return res.status(409).json({ code: 'ALREADY_RAN', message: `Late fees already computed for ${yearMonth}` });
    }

    const invoices = await Invoice.findAll({ where: { school_id: req.user.school_id } });
    let totalComputed = 0;
    let affected = 0;
    for (const inv of invoices) {
      const fee = computeLateFee(inv.toJSON(), asOfDate);
      if (fee > 0) {
        totalComputed += fee;
        affected += 1;
      }
    }
    // Record the run
    await sequelize.query(
      'INSERT INTO late_fee_runs(school_id, year_month, ran_at, invoices_evaluated, invoices_with_fee, total_fee_preview) VALUES(:schoolId, :ym, NOW(), :eval, :aff, :total)',
      { replacements: { schoolId: req.user.school_id, ym: yearMonth, eval: invoices.length, aff: affected, total: Number(totalComputed.toFixed(2)) } }
    );

    return res.json({ ran_at: new Date().toISOString(), as_of: asOfDate.toISOString(), year_month: yearMonth, invoices_evaluated: invoices.length, invoices_with_fee: affected, total_fee_preview: Number(totalComputed.toFixed(2)) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: err.errors });
    }
    console.error('Late fee run failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

export default r;


