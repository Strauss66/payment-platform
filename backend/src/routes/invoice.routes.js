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

export default r;