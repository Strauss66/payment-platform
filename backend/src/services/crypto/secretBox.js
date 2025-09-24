import crypto from 'crypto';

const REQUIRED_KEY_BYTES = 32;

function getKey() {
  const base64 = process.env.CSD_ENC_KEY || '';
  if (!base64) {
    const err = new Error('Missing CSD_ENC_KEY');
    err.code = 'CFG_MISSING';
    throw err;
  }
  let key;
  try {
    key = Buffer.from(base64, 'base64');
  } catch (e) {
    const err = new Error('Invalid base64 for CSD_ENC_KEY');
    err.code = 'CFG_INVALID';
    throw err;
  }
  if (key.length !== REQUIRED_KEY_BYTES) {
    const err = new Error('CSD_ENC_KEY must be 32 bytes (base64 of 32 bytes)');
    err.code = 'CFG_INVALID_LEN';
    throw err;
  }
  return key;
}

export function encrypt(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // AES-GCM recommended 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const input = Buffer.isBuffer(plain) ? plain : Buffer.from(String(plain), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(input), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([ciphertext, tag]);
  return { iv: iv.toString('base64'), ciphertextBase64: payload.toString('base64') };
}

export function decrypt({ iv, ciphertextBase64 }) {
  const key = getKey();
  if (!iv || !ciphertextBase64) {
    const err = new Error('Invalid payload for decrypt');
    err.code = 'DECRYPT_BAD_PAYLOAD';
    throw err;
  }
  const ivBuf = Buffer.from(iv, 'base64');
  const payload = Buffer.from(ciphertextBase64, 'base64');
  if (ivBuf.length !== 12 || payload.length < 17) {
    const err = new Error('Invalid IV or ciphertext length');
    err.code = 'DECRYPT_BAD_LENGTH';
    throw err;
  }
  const tag = payload.subarray(payload.length - 16);
  const ciphertext = payload.subarray(0, payload.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuf);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain;
}

export default { encrypt, decrypt };


