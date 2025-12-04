import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { ROLES } from '../utils/roles.js';
import { Invoice, Payment, Student, User, Enrollment, Announcement } from '../models/index.js';
import { computeLateFee } from '../services/billing/lateFee.js';

const r = Router();

function parseParentChildLinks() {
  try {
    const raw = process.env.PARENT_CHILD_LINKS || '';
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

async function isParentAuthorizedForStudent(reqUser, student) {
  const roles = reqUser?.roles || [];
  const isParent = roles.includes('student_parent');
  if (!isParent) return false;
  // Dev-friendly mapping via env; fallback to common demo accounts
  const links = parseParentChildLinks();
  const defaultLink = { parent: 'parent@weglon.test', student: 'student@weglon.test' };
  const all = [...links, defaultLink];
  const match = all.find(l => String(l.parent).toLowerCase() === String(reqUser.email || '').toLowerCase());
  if (!match) return false;
  const child = await User.findOne({ where: { email: match.student } });
  if (!child) return false;
  return Number(student.user_id) === Number(child.id);
}

// GET /api/portal/statement/:studentId
// Composes invoices + computed late fees and returns invoices[] and summary
r.get('/statement/:studentId', requireAuth, requireSameSchool, async (req, res) => {
  const schoolId = Number(req.user.school_id);
  const studentId = Number(req.params.studentId);

  // RBAC: admins/cashiers can view any; students/parents can only view their own (by Student.user_id)
  const roles = req.user?.roles || [];
  const isPrivileged = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.CASHIER) || roles.includes('admin') || roles.includes('cashier');

  const student = await Student.findByPk(studentId);
  if (!student || Number(student.school_id) !== schoolId) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Student not found' });
  }

  if (!isPrivileged) {
    const isStudentSelf = Number(student.user_id) === Number(req.user.id);
    const parentOk = await isParentAuthorizedForStudent(req.user, student);
    if (!isStudentSelf && !parentOk) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Forbidden' });
    }
  }

  const invoices = await Invoice.findAll({ where: { school_id: schoolId, student_id: studentId } });

  const asOf = new Date();
  let totalBalance = 0;
  let totalLateFees = 0;
  let openCount = 0;
  const out = invoices.map((inv) => {
    const invJson = inv.toJSON();
    const lateFee = computeLateFee({
      due_date: invJson.due_date,
      total: Number(invJson.total),
      paid_total: Number(invJson.paid_total || 0),
      balance: Number(invJson.balance)
    }, asOf);
    if (invJson.status !== 'paid') openCount += 1;
    totalBalance += Number(invJson.balance) || 0;
    totalLateFees += lateFee;
    return { ...invJson, late_fee: Number(lateFee.toFixed(2)) };
  });

  const summary = {
    total_balance: Number(totalBalance.toFixed(2)),
    total_late_fees: Number(totalLateFees.toFixed(2)),
    total_due: Number((totalBalance + totalLateFees).toFixed(2)),
    open_count: openCount
  };

  res.json({ invoices: out, summary });
});

// GET /api/portal/my-students - return students current user can view
r.get('/my-students', requireAuth, requireSameSchool, async (req, res) => {
  try {
    const schoolId = Number(req.user.school_id);
    const roles = req.user?.roles || [];
    const isPrivileged = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.CASHIER) || roles.includes('admin') || roles.includes('cashier');
    let where = { school_id: schoolId };

    if (isPrivileged) {
      // admins can see none by default here; keep empty to avoid large response
      return res.json([]);
    }

    // Student: self only
    const isStudent = !roles.includes(ROLES.TEACHER) && !roles.includes(ROLES.ADMIN) && !roles.includes(ROLES.CASHIER) && !roles.includes('teacher') && (roles.includes(ROLES.STUDENT_PARENT) || roles.includes('student_parent'));
    const out = [];

    const self = await Student.findOne({ where: { school_id: schoolId, user_id: req.user.id } });
    if (self) out.push({ id: self.id, first_name: self.first_name, last_name: self.last_name });

    // Parent mapping
    const allStudents = await Student.findAll({ where: { school_id: schoolId } });
    for (const s of allStudents) {
      const ok = await isParentAuthorizedForStudent(req.user, s);
      if (ok) out.push({ id: s.id, first_name: s.first_name, last_name: s.last_name });
    }

    // de-dupe by id
    const uniq = Array.from(new Map(out.map(o => [o.id, o])).values());
    return res.json(uniq);
  } catch (err) {
    console.error('my-students failed', err);
    return res.json([]);
  }
});

// GET /api/portal/announcements
r.get('/announcements', requireAuth, requireSameSchool, async (req, res) => {
  try {
    const schoolId = Number(req.user.school_id);
    const roles = req.user?.roles || [];
    const now = new Date();
    const from = req.query.from ? new Date(String(req.query.from)) : null;
    const to = req.query.to ? new Date(String(req.query.to)) : null;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const type = req.query.type ? String(req.query.type) : null;

    // Base active window filter
    const base = { school_id: schoolId };
    const candidates = await Announcement.findAll({ where: base, order: [['starts_at','DESC'], ['id','DESC']] });

    let visible = [];
    const isAdminish = roles.includes('admin') || roles.includes('cashier') || roles.includes('super_admin');
    if (isAdminish) {
      visible = candidates;
    } else if (roles.includes('teacher')) {
      // teacher: school-wide + classes they teach (if relation exists; here: class.teacher_id matches user.id)
      const teacherClassIds = (await Enrollment.findAll({ where: { }, limit: 0 })).map(() => -1); // placeholder; no teacher-class model, fallback to school-wide only
      visible = candidates.filter((a) => a.audience_scope === 'all');
    } else {
      // student or parent scope
      const myStudents = [];
      const selfStudent = await Student.findOne({ where: { school_id: schoolId, user_id: req.user.id } });
      if (selfStudent) myStudents.push(selfStudent);
      const allStudents = await Student.findAll({ where: { school_id: schoolId } });
      for (const s of allStudents) {
        const ok = await isParentAuthorizedForStudent(req.user, s);
        if (ok) myStudents.push(s);
      }
      const uniqStudents = Array.from(new Map(myStudents.map(s => [s.id, s])).values());
      const studentIds = uniqStudents.map(s => Number(s.id));
      const levelIds = uniqStudents.map(s => Number(s.level_id)).filter(Boolean);
      const classIds = [];
      if (studentIds.length) {
        const enrolls = await Enrollment.findAll({ where: { student_id: studentIds } });
        classIds.push(...enrolls.map(e => Number(e.class_id)));
      }

      visible = candidates.filter((a) => {
        const isActive = (!a.starts_at || new Date(a.starts_at) <= now) && (!a.ends_at || now < new Date(a.ends_at));
        if (!isActive) return false;
        if (type && a.type !== type) return false;
        if (from && new Date(a.starts_at || a.created_at) < from) return false;
        if (to && new Date(a.starts_at || a.created_at) > to) return false;
        if (a.audience_scope === 'all') return true;
        if (a.audience_scope === 'levels') {
          const targets = Array.isArray(a.target_level_ids) ? a.target_level_ids.map(Number) : [];
          return targets.some((id) => levelIds.includes(Number(id)));
        }
        if (a.audience_scope === 'classes') {
          const targets = Array.isArray(a.target_class_ids) ? a.target_class_ids.map(Number) : [];
          return targets.some((id) => classIds.includes(Number(id)));
        }
        if (a.audience_scope === 'students') {
          const targets = Array.isArray(a.target_student_ids) ? a.target_student_ids.map(Number) : [];
          return targets.some((id) => studentIds.includes(Number(id)));
        }
        return false;
      });
    }

    // Always treat active window for non-admin requestors
    if (!roles.includes('admin') && !roles.includes('cashier') && !roles.includes('super_admin')) {
      visible = visible.filter((a) => (!a.starts_at || new Date(a.starts_at) <= now) && (!a.ends_at || now < new Date(a.ends_at)));
    }

    const count = visible.length;
    const paged = visible.slice(offset, offset + limit).map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      body: a.body,
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      audience_scope: a.audience_scope,
      targets: {
        levels: Array.isArray(a.target_level_ids) ? a.target_level_ids : [],
        classes: Array.isArray(a.target_class_ids) ? a.target_class_ids : [],
        students: Array.isArray(a.target_student_ids) ? a.target_student_ids : []
      }
    }));
    return res.json({ rows: paged, count });
  } catch (err) {
    console.error('portal announcements failed', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

export default r;

// --- Additional MVP endpoints for parent/student portal ---
// GET /api/portal/summary - aggregate balance and next due for authorized students
r.get('/summary', requireAuth, requireSameSchool, async (req, res) => {
  try {
    const schoolId = Number(req.user.school_id);
    const roles = req.user?.roles || [];
    const isPrivileged = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.CASHIER) || roles.includes('admin') || roles.includes('cashier');
    if (isPrivileged) return res.status(403).json({ message: 'Forbidden' });

    const my = [];
    const self = await Student.findOne({ where: { school_id: schoolId, user_id: req.user.id } });
    if (self) my.push(self);
    const all = await Student.findAll({ where: { school_id: schoolId } });
    for (const s of all) {
      const ok = await isParentAuthorizedForStudent(req.user, s);
      if (ok) my.push(s);
    }
    const uniq = Array.from(new Map(my.map(s => [s.id, s])).values());
    if (!uniq.length) return res.json({ total_balance: 0, next_due_date: null, next_due_amount: 0 });

    const ids = uniq.map(s => s.id);
    const invoices = await Invoice.findAll({ where: { school_id: schoolId, student_id: ids } });
    let total_balance = 0;
    let next_due_date = null;
    let next_due_amount = 0;
    for (const inv of invoices) {
      const bal = Number(inv.balance || 0);
      total_balance += bal;
      if (bal > 0 && inv.due_date) {
        const d = new Date(inv.due_date);
        if (!next_due_date || d < new Date(next_due_date)) {
          next_due_date = d.toISOString();
          next_due_amount = bal;
        }
      }
    }
    return res.json({ total_balance: Number(total_balance.toFixed(2)), next_due_date, next_due_amount: Number(next_due_amount.toFixed(2)) });
  } catch (e) {
    console.error('portal/summary failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /api/portal/payments - list payments for authorized students
r.get('/payments', requireAuth, requireSameSchool, async (req, res) => {
  try {
    const schoolId = Number(req.user.school_id);
    const roles = req.user?.roles || [];
    const isPrivileged = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.CASHIER) || roles.includes('admin') || roles.includes('cashier');
    if (isPrivileged) return res.status(403).json({ message: 'Forbidden' });

    const allStudents = await Student.findAll({ where: { school_id: schoolId } });
    const allowed = [];
    const self = await Student.findOne({ where: { school_id: schoolId, user_id: req.user.id } });
    if (self) allowed.push(self.id);
    for (const s of allStudents) {
      const ok = await isParentAuthorizedForStudent(req.user, s);
      if (ok) allowed.push(s.id);
    }
    const uniqIds = Array.from(new Set(allowed));
    if (!uniqIds.length) return res.json({ rows: [], count: 0 });

    // get invoices for allowed students, then their payments
    const invoices = await Invoice.findAll({ where: { school_id: schoolId, student_id: uniqIds } });
    const invIds = invoices.map(i => i.id);
    if (!invIds.length) return res.json({ rows: [], count: 0 });
    const rows = await Payment.findAll({ where: { school_id: schoolId, invoice_id: invIds }, order: [['paid_at','DESC']] });
    return res.json({ rows, count: rows.length });
  } catch (e) {
    console.error('portal/payments failed', e);
    return res.status(500).json({ message: 'Internal error' });
  }
});
