import { InvoicingEntity, Invoice, InvoiceItem, TaxIdentity, Student } from '../../models/index.js';

function assert(value, code, message, field) {
  if (value) return;
  const err = new Error(message);
  err.code = code;
  if (field) err.field = field;
  throw err;
}

function toTwo(num) {
  return Number(num).toFixed(2);
}

function nowCfdiTs() {
  // CFDI requires local time in ISO 8601 without timezone designator (e.g., 2025-09-16T12:34:56)
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const SAT = {
  cMoneda: ['MXN'],
  cMetodoPago: ['PUE', 'PPD'],
  cFormaPago: ['01','02','03','04','28','99'],
  cImpuesto: { IVA: '002' },
  cObjetoImp: { no_objeto: '01', si_objeto: '02', si_exento: '03' },
};

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml({ comprobante, emisor, receptor, conceptos }) {
  const xmlns = 'http://www.sat.gob.mx/cfd/4';
  const xsi = 'http://www.w3.org/2001/XMLSchema-instance';
  const schema = 'http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd';
  const attrs = Object.entries(comprobante)
    .map(([k, v]) => `${k}="${xmlEscape(v)}"`).join(' ');

  const emisorAttrs = Object.entries(emisor)
    .map(([k, v]) => `${k}="${xmlEscape(v)}"`).join(' ');
  const receptorAttrs = Object.entries(receptor)
    .map(([k, v]) => `${k}="${xmlEscape(v)}"`).join(' ');

  const conceptosXml = conceptos.map((c) => {
    const baseAttrs = Object.entries(c.base)
      .map(([k, v]) => `${k}="${xmlEscape(v)}"`).join(' ');
    let impXml = '';
    if (c.impuestos) {
      const tras = c.impuestos.traslados.map((t) => {
        const a = Object.entries(t)
          .map(([k, v]) => `${k}="${xmlEscape(v)}"`).join(' ');
        return `<cfdi:Traslado ${a}/>`;
      }).join('');
      impXml = `<cfdi:Impuestos><cfdi:Traslados>${tras}</cfdi:Traslados></cfdi:Impuestos>`;
    }
    return `<cfdi:Concepto ${baseAttrs}>${impXml}</cfdi:Concepto>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<cfdi:Comprobante xmlns:cfdi="${xmlns}" xmlns:xsi="${xsi}" xsi:schemaLocation="${xmlns} ${schema}" ${attrs}>` +
    `<cfdi:Emisor ${emisorAttrs}/>` +
    `<cfdi:Receptor ${receptorAttrs}/>` +
    `<cfdi:Conceptos>${conceptosXml}</cfdi:Conceptos>` +
    `</cfdi:Comprobante>`;
}

export async function buildInvoiceCfdiDraft({ invoiceId, schoolId }) {
  assert(invoiceId, 'VALIDATION_ERROR', 'invoiceId required', 'invoiceId');
  assert(schoolId, 'VALIDATION_ERROR', 'schoolId required', 'schoolId');

  const invoice = await Invoice.findOne({ where: { id: invoiceId, school_id: schoolId }, include: [{ model: InvoiceItem, as: 'items' }] });
  assert(invoice, 'NOT_FOUND', 'Invoice not found');

  const student = await Student.findByPk(invoice.student_id);

  // Receptor: prefer by student tax identity for now
  const receptor = await TaxIdentity.findOne({ where: { school_id: schoolId, student_id: invoice.student_id } });
  assert(receptor, 'PRECONDITION_FAILED', 'Missing receptor tax identity for student', 'receptor');

  // Emitter: default entity for school
  const emitter = await InvoicingEntity.findOne({ where: { school_id: schoolId, is_default: 1 } });
  assert(emitter, 'PRECONDITION_FAILED', 'Missing emitter invoicing entity', 'emitter');
  assert(emitter.rfc, 'PRECONDITION_FAILED', 'Emitter RFC required', 'emitter.rfc');
  assert(emitter.regimen_fiscal, 'PRECONDITION_FAILED', 'Emitter regimen fiscal required', 'emitter.regimen_fiscal');

  // Totals and concepts
  const conceptos = [];
  let subtotal = 0;
  let totalImpuestosTrasladados = 0;
  for (const it of invoice.items) {
    const cantidad = Number(it.qty);
    const unit = Number(it.unit_price);
    const discount = Number(it.discount_amount || 0);
    const lineBase = cantidad * unit - discount;
    subtotal += lineBase;
    const taxAmt = Number(it.tax_amount || 0);
    const hasIva16 = taxAmt > 0.0001;
    const objetoImp = hasIva16 ? SAT.cObjetoImp.si_objeto : SAT.cObjetoImp.no_objeto;
    const concepto = {
      base: {
        ClaveProdServ: '84111506', // default school service placeholder
        Cantidad: toTwo(cantidad),
        ClaveUnidad: 'E48', // Service unit
        Descripcion: it.description,
        ValorUnitario: toTwo(unit),
        Importe: toTwo(lineBase),
        Descuento: discount > 0 ? toTwo(discount) : undefined,
        ObjetoImp: objetoImp
      },
      impuestos: undefined
    };
    if (!hasIva16) {
      // No impuestos node if not object or exento
    } else {
      const base = lineBase;
      // derive Tasa from amount if given, otherwise 16%
      const tasa = Math.abs(base) > 0.0001 ? (taxAmt / base) : 0.16;
      totalImpuestosTrasladados += taxAmt;
      concepto.impuestos = {
        traslados: [{
          Base: toTwo(base),
          Impuesto: SAT.cImpuesto.IVA,
          TipoFactor: 'Tasa',
          TasaOCuota: tasa.toFixed(6),
          Importe: toTwo(taxAmt)
        }]
      };
    }
    // Remove undefined attrs
    concepto.base = Object.fromEntries(Object.entries(concepto.base).filter(([,v]) => v !== undefined));
    conceptos.push(concepto);
  }

  const total = subtotal + totalImpuestosTrasladados - Number(invoice.discount_total || 0);

  // Determine LugarExpedicion from emitter address postal code if available, else receptor
  const lugarExp = (emitter.address_json && (emitter.address_json.cp || emitter.address_json.postal_code)) || receptor.postal_code;

  const comprobante = {
    Version: '4.0',
    Serie: invoice.serie || '',
    Folio: invoice.folio || String(invoice.id),
    Fecha: nowCfdiTs(),
    Sello: '',
    NoCertificado: emitter.cert_serial || '',
    Certificado: '',
    Moneda: 'MXN',
    Exportacion: '01',
    SubTotal: toTwo(subtotal),
    Descuento: Number(invoice.discount_total || 0) > 0 ? toTwo(invoice.discount_total) : undefined,
    Total: toTwo(total),
    TipoDeComprobante: 'I',
    MetodoPago: 'PPD',
    FormaPago: '99',
    LugarExpedicion: lugarExp
  };
  const emisor = {
    Rfc: emitter.rfc,
    Nombre: emitter.name,
    RegimenFiscal: emitter.regimen_fiscal
  };
  const receptorNode = {
    Rfc: receptor.rfc,
    Nombre: receptor.name,
    DomicilioFiscalReceptor: receptor.postal_code,
    UsoCFDI: receptor.uso_cfdi,
    RegimenFiscalReceptor: receptor.regimen_fiscal_receptor || undefined
  };

  const xmlDraft = buildXml({ comprobante: Object.fromEntries(Object.entries(comprobante).filter(([,v]) => v !== undefined)), emisor, receptor: Object.fromEntries(Object.entries(receptorNode).filter(([,v]) => v !== undefined)), conceptos });

  const totals = {
    subtotal: Number(subtotal.toFixed(2)),
    taxes: Number(totalImpuestosTrasladados.toFixed(2)),
    total: Number(total.toFixed(2))
  };
  const previewMeta = {
    emitter: { id: emitter.id, name: emitter.name, rfc: emitter.rfc, regimenFiscal: emitter.regimen_fiscal },
    receptor: { id: receptor.id, rfc: receptor.rfc, name: receptor.name, usoCfdi: receptor.uso_cfdi },
    invoice: { id: invoice.id, serie: comprobante.Serie || null, folio: comprobante.Folio || null }
  };

  return { xmlDraft, totals, previewMeta };
}

export default { buildInvoiceCfdiDraft };


