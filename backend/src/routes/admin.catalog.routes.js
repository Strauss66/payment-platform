import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { tenantScope } from '../middleware/tenancy.js';
import { sequelize } from '../config/db.js';

const r = Router();

// Whitelisted admin catalogs and whether they are tenant-scoped by school_id
const catalogs = {
  schools: { table: 'schools', scoped: false },
  levels: { table: 'levels', scoped: true },
  school_years: { table: 'school_years', scoped: true },
  holidays: { table: 'holidays', scoped: true },
  custom_fields: { table: 'custom_fields', scoped: true },
  enrollment_series: { table: 'enrollment_series', scoped: true },
  incident_types: { table: 'incident_types', scoped: true },
  procedure_types: { table: 'procedure_types', scoped: true },
  buildings: { table: 'buildings', scoped: true },
  classrooms: { table: 'classrooms', scoped: false },
  families: { table: 'families', scoped: true },
  parents: { table: 'parents', scoped: true },
  students: { table: 'students', scoped: true },
  groups: { table: 'groups', scoped: true },
  study_plans: { table: 'study_plans', scoped: true },
  subjects: { table: 'subjects', scoped: true },
  enrollment_periods: { table: 'enrollment_periods', scoped: true },
  timetables: { table: 'timetables', scoped: true },
  grading_periods: { table: 'grading_periods', scoped: true },
  grade_reviews: { table: 'grade_reviews', scoped: true },
  report_ack_windows: { table: 'report_ack_windows', scoped: true },
  report_acks: { table: 'report_acks', scoped: true },
  charge_concepts: { table: 'charge_concepts', scoped: true },
  products: { table: 'products', scoped: true },
  payment_methods: { table: 'payment_methods', scoped: true },
  tuition_plans: { table: 'tuition_plans', scoped: true },
  billing_prefs: { table: 'billing_prefs', scoped: true },
  cash_registers: { table: 'cash_registers', scoped: true },
  cash_sessions: { table: 'cash_sessions', scoped: true },
  invoices: { table: 'invoices', scoped: true },
  payments: { table: 'payments', scoped: true },
  scholarship_types: { table: 'scholarship_types', scoped: true },
  scholarships: { table: 'scholarships', scoped: true },
  announcements: { table: 'announcements', scoped: true },
  calendar_events: { table: 'calendar_events', scoped: true },
  banners: { table: 'banners', scoped: true },
  links: { table: 'links', scoped: true },
  files: { table: 'files', scoped: true },
  audit_logs: { table: 'audit_logs', scoped: true },
  roles: { table: 'roles', scoped: false },
  permissions: { table: 'permissions', scoped: false }
};

// Read-only list endpoints
r.get('/:resource', requireAuth, requireRoles('admin','super_admin'), tenantScope, async (req, res) => {
  const def = catalogs[req.params.resource];
  if (!def) return res.status(404).json({ message: 'Unknown catalog' });
  const { table, scoped } = def;
  const { limit = 50, offset = 0 } = req.query;
  try {
    let sql = `SELECT * FROM ${table}`;
    const repl = [];
    if (scoped && req.context?.schoolId != null) {
      sql += ' WHERE school_id = ?';
      repl.push(Number(req.context.schoolId));
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    repl.push(Number(limit), Number(offset));
    const [rows] = await sequelize.query(sql, { replacements: repl });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Mutations with RBAC guards
r.post('/:resource', requireAuth, requireRoles('admin','super_admin'), tenantScope, async (req, res) => {
  const def = catalogs[req.params.resource];
  if (!def) return res.status(404).json({ message: 'Unknown catalog' });
  const { table, scoped } = def;
  try {
    const data = { ...req.body };
    if (scoped) data.school_id = req.context?.schoolId ?? data.school_id;
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(',');
    const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${placeholders})`;
    const [, meta] = await sequelize.query(sql, { replacements: fields.map(f => data[f]) });
    res.status(201).json({ id: meta?.insertId, ...data });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

r.put('/:resource/:id', requireAuth, requireRoles('admin','super_admin'), tenantScope, async (req, res) => {
  const def = catalogs[req.params.resource];
  if (!def) return res.status(404).json({ message: 'Unknown catalog' });
  const { table, scoped } = def;
  try {
    const data = { ...req.body };
    const fields = Object.keys(data);
    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
    const set = fields.map(f => `${f} = ?`).join(',');
    let sql = `UPDATE ${table} SET ${set} WHERE id = ?`;
    const repl = [...fields.map(f => data[f]), Number(req.params.id)];
    if (scoped && req.context?.schoolId != null) {
      sql += ' AND school_id = ?';
      repl.push(Number(req.context.schoolId));
    }
    await sequelize.query(sql, { replacements: repl });
    res.json({ id: Number(req.params.id), ...data });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

r.delete('/:resource/:id', requireAuth, requireRoles('admin','super_admin'), tenantScope, async (req, res) => {
  const def = catalogs[req.params.resource];
  if (!def) return res.status(404).json({ message: 'Unknown catalog' });
  const { table, scoped } = def;
  try {
    let sql = `DELETE FROM ${table} WHERE id = ?`;
    const repl = [Number(req.params.id)];
    if (scoped && req.context?.schoolId != null) {
      sql += ' AND school_id = ?';
      repl.push(Number(req.context.schoolId));
    }
    await sequelize.query(sql, { replacements: repl });
    res.status(204).send();
  } catch (e) {
    // FK restriction will throw here -> translate to 409
    res.status(409).json({ message: e.message });
  }
});

export default r;


