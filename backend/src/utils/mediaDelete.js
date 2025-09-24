/**
 * S3 delete helpers for announcement media.
 * Deletes only keys under schools/{schoolId}/announcements/ to prevent accidental data loss.
 * Best-effort operation with optional DEBUG logs; route handlers should not fail the request on S3 errors.
 */
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = process.env.S3_BUCKET;
const s3 = new S3Client({ region: REGION });
const DEBUG = String(process.env.DEBUG || '').toLowerCase() === 'true';

/**
 * Defensive: only allow deletes under our announcements prefix.
 * @param {string} key - S3 object key (e.g. "schools/1/announcements/abc.jpg").
 * @param {string|number} schoolId - School identifier; normalized to string.
 * @returns {boolean} True when key is inside the school's announcements prefix.
 */
function isSafeKey(key, schoolId){
  if (!key || typeof key !== "string") return false;
  // e.g. "schools/1/announcements/....jpg"
  const sid = String(schoolId);
  const allowedPrefix = `schools/${sid}/announcements/`;
  return key.startsWith(allowedPrefix);
}

/**
 * Delete a batch of announcement image keys from S3 (best effort).
 * - Skips when bucket is missing, no keys provided, or none pass safety filter.
 * - Logs summary when DEBUG=true.
 * @param {string[]} keys - Candidate S3 keys to delete.
 * @param {string|number} schoolId - School identifier for safety filtering.
 * @returns {Promise<{deleted:number, errors:Array<{key?:string, code?:string, msg?:string}>}>}
 */
export async function deleteAnnouncementKeys(keys = [], schoolId) {
  if (!BUCKET || !Array.isArray(keys) || keys.length === 0) {
    if (DEBUG) console.debug('[s3:delete] skip: no bucket or keys', { BUCKET, keysCount: keys?.length || 0 });
    return { deleted: 0, errors: [] };
  }
  const safeKeys = keys.filter(k => isSafeKey(k, schoolId));
  if (DEBUG) console.debug('[s3:delete] input', { schoolId, total: keys.length, safe: safeKeys.length, sample: safeKeys.slice(0,3) });
  if (safeKeys.length === 0) return { deleted: 0, errors: [] };
  try {
    const out = await s3.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: safeKeys.map(Key => ({ Key })), Quiet: true }
    }));
    const deleted = (out.Deleted || []).length;
    const errors = (out.Errors || []).map(e => ({ key: e?.Key, code: e?.Code, msg: e?.Message }));
    if (DEBUG) console.debug('[s3:delete] result', { deleted, errors });
    return { deleted, errors };
  } catch (err) {
    if (DEBUG) console.debug('[s3:delete] throw', { name: err?.name, message: err?.message });
    return { deleted: 0, errors: [{ code: err?.name, msg: err?.message }] };
  }
}


