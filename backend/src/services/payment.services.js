import { sequelize } from '../config/db.js';
import { Payment, PaymentAllocation, Invoice, InvoiceItem } from '../models/index.js';

export async function postPayment({ school_id, student_id, method, amount, received_at, allocations = [] }) {
  return await sequelize.transaction(async (t) => {
    const payment = await Payment.create({
      school_id, student_id, method, amount, received_at: received_at ? new Date(received_at) : new Date(), status: 'completed'
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

    return { payment, remaining_unallocated: remaining };
  });
}