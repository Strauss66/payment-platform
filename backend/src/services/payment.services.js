import { sequelize } from '../config/db.js';
import { Payment, PaymentAllocation, Invoice } from '../models/index.js';

export async function postPayment({
  school_id,
  cashier_user_id,
  session_id,
  amount,
  payment_method_id,
  paid_at,
  note,
  allocations = []
}) {
  return await sequelize.transaction(async (t) => {
    if (!Array.isArray(allocations) || allocations.length === 0) {
      const err = new Error('At least one allocation is required');
      err.status = 400;
      throw err;
    }
    const primaryInvoiceId = Number(allocations[0]?.invoice_id);
    if (!Number.isFinite(primaryInvoiceId)) {
      const err = new Error('Primary invoice_id missing in allocations');
      err.status = 400;
      throw err;
    }

    const payment = await Payment.create({
      school_id,
      invoice_id: primaryInvoiceId,
      payment_method_id: payment_method_id ? Number(payment_method_id) : null,
      amount: Number(amount),
      paid_at: paid_at ? new Date(paid_at) : new Date(),
      cashier_user_id: cashier_user_id || null,
      session_id: session_id || null,
      note: note || null
    }, { transaction: t });

    let remaining = Number(amount);

    for (const a of allocations) {
      const allocAmt = Number(a.amount);
      if (allocAmt <= 0) continue;

      await PaymentAllocation.create({
        payment_id: payment.id,
        invoice_id: a.invoice_id,
        invoice_item_id: a.invoice_item_id || null,
        amount: allocAmt
      }, { transaction: t });

      // decrease invoice balance
      const inv = await Invoice.findByPk(a.invoice_id, { transaction: t, lock: t.LOCK.UPDATE });
      const newBal = Number(inv.balance) - allocAmt;
      let newStatus = inv.status;
      if (newBal <= 0) { newStatus = 'paid'; }
      else if (newBal < inv.total) { newStatus = 'partial'; }
      await inv.update({ balance: newBal < 0 ? 0 : newBal, status: newStatus }, { transaction: t });

      remaining -= allocAmt;
    }

    const json = payment.toJSON();
    return { payment: json, remaining_unallocated: remaining };
  });
}