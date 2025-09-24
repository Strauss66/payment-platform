import { PacAdapter, PacError } from './pac.adapter.js';
import crypto from 'crypto';

function buildFakeTfdXml(uuid, stampedAtIso) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<TimbreFiscalDigital Version="1.1" UUID="${uuid}" FechaTimbrado="${stampedAtIso}" RfcProvCertif="AAAA010101AAA" SelloCFD="" NoCertificadoSAT="00001000000501234567" SelloSAT="" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/timbrefiscaldigital/TimbreFiscalDigitalv11.xsd"/>`;
}

function injectTfdIntoCfdi(xml, tfdXml) {
  // naive injection: place before closing Comprobante
  const closing = '</cfdi:Comprobante>';
  const idx = xml.lastIndexOf(closing);
  if (idx === -1) return xml + tfdXml; // fallback
  return xml.slice(0, idx) + tfdXml + closing;
}

export class PacSandboxAdapter extends PacAdapter {
  async stamp(cfdiXmlOrJson) {
    const uuid = crypto.randomUUID();
    const stampedAt = new Date();
    const stampedAtIso = stampedAt.toISOString();
    const xml = typeof cfdiXmlOrJson === 'string' ? cfdiXmlOrJson : JSON.stringify(cfdiXmlOrJson);
    const tfdXml = buildFakeTfdXml(uuid, stampedAtIso);
    const stampedXml = injectTfdIntoCfdi(xml, tfdXml);
    return { uuid, xml: stampedXml, tfdXml, stampedAt };
  }

  async cancel({ uuid, motivo }) {
    if (!uuid) throw new PacError('BAD_REQUEST', 'UUID required');
    if (!motivo) throw new PacError('BAD_REQUEST', 'motivo required');
    return { canceledAt: new Date() };
  }
}

export default { PacSandboxAdapter };


