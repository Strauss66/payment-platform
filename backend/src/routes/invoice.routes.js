import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import * as InvoiceService from '../services/invoice.services.js';

const r = Router();

// Issue a new invoice with line items
r.post('/', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  const result = await InvoiceService.createInvoice({
    school_id: req.user.school_id,
    ...req.body
  });
  res.status(201).json(result);
});

// Get student invoices (open)
r.get('/student/:studentId', requireAuth, requireSameSchool, async (req, res) => {
  const list = await InvoiceService.getStudentInvoices(req.user.school_id, req.params.studentId);
  res.json(list);
});

// Get invoice by id with computed late fee
r.get('/:id', requireAuth, requireSameSchool, async (req, res) => {
  const id = Number(req.params.id);
  const list = await InvoiceService.getStudentInvoices(req.user.school_id, req.query.student_id);
  const found = list.find(i => Number(i.id) === id);
  if (!found) return res.status(404).json({ message: 'Not found' });
  res.json(found);
});

export default r;