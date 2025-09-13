import PDFDocument from 'pdfkit';
import { Payment, CashSession } from '../../models/index.js';

export async function generateZReport({ sessionId, schoolId, writeStream }) {
  const session = await CashSession.findByPk(sessionId);
  if (!session || Number(session.school_id) !== Number(schoolId)) throw Object.assign(new Error('Not found'), { status: 404, code: 'NOT_FOUND' });
  const payments = await Payment.findAll({ where: { school_id: schoolId, session_id: session.id } });
  const totalsByMethod = payments.reduce((acc, p) => {
    const key = String(p.payment_method_id);
    acc[key] = (acc[key] || 0) + Number(p.amount || 0);
    return acc;
  }, {});
  const expectedCash = Object.entries(totalsByMethod).filter(([k]) => k === '1').reduce((a,[,v]) => a + v, 0);
  const countedCash = Number(session?.totals_json?.counted_cash || 0);
  const variance = Number((countedCash - expectedCash).toFixed(2));

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  doc.pipe(writeStream);
  doc.fontSize(16).text('Z Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Session #${session.id}`);
  doc.text(`Opened: ${new Date(session.opened_at).toLocaleString()}`);
  doc.text(`Closed: ${session.closed_at ? new Date(session.closed_at).toLocaleString() : 'Open'}`);
  doc.moveDown(0.5);
  doc.fontSize(12).text('Totals by Method:');
  Object.entries(totalsByMethod).forEach(([method, total]) => {
    doc.fontSize(10).text(`Method ${method}: $${Number(total).toFixed(2)}`);
  });
  doc.moveDown(0.5);
  doc.fontSize(12).text('Reconciliation:');
  doc.fontSize(10).text(`Expected Cash: $${expectedCash.toFixed(2)}`);
  doc.text(`Counted Cash: $${countedCash.toFixed(2)}`);
  doc.text(`Variance: $${variance.toFixed(2)}`);
  doc.moveDown(1);
  doc.fontSize(12).text('Signatures:');
  doc.moveDown(2);
  doc.text('Cashier: __________________________    Date: ____________');
  doc.moveDown(1);
  doc.text('Manager: __________________________    Date: ____________');

  doc.end();
}

export default { generateZReport };


