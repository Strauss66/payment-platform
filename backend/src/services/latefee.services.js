// src/services/latefee.service.js
import { sequelize } from '../config/db.js';
import { Invoice } from '../models/index.js';
import dayjs from 'dayjs';

export async function runLateFees({ school_id }) {
  // Query overdue invoices, compute fee per policy, insert penalty invoice_items and update balances.
  // You already have the tables; implement the policy logic here.
  // Keep a run record in late_fee_runs and generated items in late_fee_items.
  return { ok: true, ran_at: new Date().toISOString() };
}