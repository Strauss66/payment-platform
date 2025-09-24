import PDFDocument from 'pdfkit';

function pesos(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));
}

export async function renderCfdiPdf({ emitter, receptor, invoice, items, totals, uuid, qrPngBuffer }) {
  const doc = new PDFDocument({ margin: 36, size: 'A4' });
  const chunks = [];
  return await new Promise((resolve, reject) => {
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(16).text(emitter?.name || 'Emisor', { align: 'left' });
    doc.moveDown(0.2);
    doc.fontSize(10).text(`RFC: ${emitter?.rfc || ''}`);
    doc.text(`Régimen Fiscal: ${emitter?.regimen_fiscal || ''}`);
    if (emitter?.address_json) {
      const a = emitter.address_json;
      doc.text(`${a?.street || ''} ${a?.ext || ''} ${a?.city || ''} ${a?.state || ''} CP ${a?.cp || a?.postal_code || ''}`);
    }

    doc.moveDown(0.6);
    doc.fontSize(14).text('Receptor', { underline: true });
    doc.fontSize(10).text(`${receptor?.name || ''}`);
    doc.text(`RFC: ${receptor?.rfc || ''}`);
    doc.text(`Uso CFDI: ${receptor?.uso_cfdi || ''}`);
    doc.text(`CP: ${receptor?.postal_code || ''}`);

    doc.moveDown(0.8);
    doc.fontSize(12).text(`Factura: ${invoice?.serie || ''} ${invoice?.folio || invoice?.id || ''}`);
    doc.text(`Fecha: ${new Date().toLocaleString('es-MX')}`);

    doc.moveDown(0.5);
    doc.fontSize(12).text('Conceptos', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);

    const startY = doc.y;
    doc.text('Descripción', 36, startY, { width: 300 });
    doc.text('Cantidad', 340, startY, { width: 60, align: 'right' });
    doc.text('P. Unit', 400, startY, { width: 70, align: 'right' });
    doc.text('Importe', 470, startY, { width: 90, align: 'right' });
    doc.moveDown(0.2);
    doc.moveTo(36, doc.y).lineTo(560, doc.y).stroke();

    const list = items || [];
    for (const it of list) {
      const y = doc.y + 4;
      doc.text(String(it.description || ''), 36, y, { width: 300 });
      doc.text(Number(it.qty || 1).toFixed(2), 340, y, { width: 60, align: 'right' });
      doc.text(pesos(it.unit_price || 0), 400, y, { width: 70, align: 'right' });
      doc.text(pesos(it.line_total || (Number(it.qty||1) * Number(it.unit_price||0))), 470, y, { width: 90, align: 'right' });
      doc.moveDown(1);
    }

    doc.moveDown(0.5);
    doc.moveTo(340, doc.y).lineTo(560, doc.y).stroke();
    const t = totals || { subtotal: 0, taxes: 0, total: 0 };
    const line = (label, value) => {
      const y = doc.y + 4;
      doc.text(label, 340, y, { width: 120, align: 'right' });
      doc.text(pesos(value), 470, y, { width: 90, align: 'right' });
      doc.moveDown(1);
    };
    line('Subtotal', t.subtotal || 0);
    if (Number(t.taxes || 0) !== 0) line('IVA', t.taxes || 0);
    line('Total', t.total || 0);

    if (uuid) {
      doc.moveDown(1);
      doc.fontSize(10).text(`UUID: ${uuid}`);
    }
    if (qrPngBuffer && Buffer.isBuffer(qrPngBuffer)) {
      try { doc.image(qrPngBuffer, 36, doc.y + 8, { width: 120 }); } catch {}
    }

    doc.end();
  });
}

export default { renderCfdiPdf };


