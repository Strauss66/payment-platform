import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { ROLES } from '../utils/roles.js';
import { Invoice, Student, User } from '../models/index.js';
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

export default r;


