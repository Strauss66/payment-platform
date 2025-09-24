import crypto from 'crypto';
import { encrypt } from '../crypto/secretBox.js';

// Accepts base64 certificate (.cer) and key (.key) as base64 strings
// Returns serial (hex uppercase without spaces), validFrom, validTo, and encrypted key/pass payloads
export async function parseAndProtectCsd({ csdCertB64, csdKeyB64, csdPassPlain }) {
  if (!csdCertB64) {
    const err = new Error('csdCertB64 required');
    err.code = 'VALIDATION_ERROR';
    err.field = 'csdCertB64';
    throw err;
  }

  // Parse certificate using Node 19+ X509Certificate
  let cert;
  try {
    const certDer = Buffer.from(csdCertB64, 'base64');
    cert = new crypto.X509Certificate(certDer);
  } catch (e) {
    const err = new Error('Invalid certificate data');
    err.code = 'BAD_CERT';
    throw err;
  }

  const serial = cert.serialNumber.replace(/[^0-9A-F]/gi, '').toUpperCase();
  const validFrom = new Date(cert.validFrom);
  const validTo = new Date(cert.validTo);

  // Encrypt key and password if provided
  let keyEnc = null;
  let passEnc = null;
  if (csdKeyB64) {
    const { iv, ciphertextBase64 } = encrypt(Buffer.from(csdKeyB64, 'base64'));
    keyEnc = { iv, ciphertextBase64 };
  }
  if (csdPassPlain != null) {
    const { iv, ciphertextBase64 } = encrypt(String(csdPassPlain));
    passEnc = { iv, ciphertextBase64 };
  }

  return {
    certMeta: { serial, validFrom, validTo },
    keyEnc,
    passEnc
  };
}

export default { parseAndProtectCsd };


