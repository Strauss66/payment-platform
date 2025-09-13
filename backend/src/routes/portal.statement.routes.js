import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import { ROLES } from '../utils/roles.js';
import { Invoice, Student } from '../models/index.js';
import { computeLateFee } from '../services/billing/lateFee.js';

const r = Router();

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
    // Allow only if this student is linked to the current user (covers student; parent linkage not modeled here)
    if (Number(student.user_id) !== Number(req.user.id)) {
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

export default r;


