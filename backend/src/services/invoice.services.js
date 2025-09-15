import { sequelize } from '../config/db.js';
import { Invoice, InvoiceItem } from '../models/index.js';
import dayjs from 'dayjs';
import { computeLateFee as computeLateFeePolicy } from './billing/lateFee.js';

// Consolidated late fee policy sourced from services/billing/lateFee.js

export async function createInvoice({ school_id, student_id, number, due_date, items = [] }) {
  return await sequelize.transaction(async (t) => {
    const invoice = await Invoice.create({
      school_id,
      student_id,
      number,
      status: 'open',
      due_date: due_date ? dayjs(due_date).format('YYYY-MM-DD') : dayjs().add(14, 'day').format('YYYY-MM-DD')
    }, { transaction: t });

    let subtotal = 0, discount_total = 0, tax_total = 0;
    for (const it of items) {
      const qty = Number(it.qty || 1);
      const unit = Number(it.unit_price || 0);
      const disc = Number(it.discount_amount || 0);
      const tax  = Number(it.tax_amount || 0);
      const line_total = (qty * unit) - disc + tax;

      await InvoiceItem.create({
        invoice_id: invoice.id,
        fee_id: it.fee_id,
        description: it.description || 'Charge',
        qty, unit_price: unit, discount_amount: disc, tax_amount: tax, line_total
      }, { transaction: t });

      subtotal += qty * unit;
      discount_total += disc;
      tax_total += tax;
    }

    const total = subtotal - discount_total + tax_total;
    await invoice.update({ subtotal, discount_total, tax_total, total, balance: total }, { transaction: t });

    return invoice;
  });
}

export async function getStudentInvoices(school_id, student_id) {
  const list = await Invoice.findAll({
    where: { school_id, student_id },
    include: [{ model: InvoiceItem }]
  });
  // Decorate with computed late fee without mutating stored totals
  return list.map(inv => {
    const json = inv.toJSON();
    json.late_fee_computed = computeLateFee(json, new Date());
    return json;
  });
}