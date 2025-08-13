import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { requireSameSchool } from '../middleware/tenancy.js';
import * as PaymentService from '../services/payment.services.js';

const r = Router();

// Record a payment and allocate to invoice items
r.post('/', requireAuth, requireRoles('admin','cashier'), requireSameSchool, async (req, res) => {
  const result = await PaymentService.postPayment({
    school_id: req.user.school_id,
    ...req.body
  });
  res.status(201).json(result);
});

export default r;