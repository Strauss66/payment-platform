// backend/src/utils/mediaSigner.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MODE = process.env.SIGN_MEDIA_MODE || "s3"; // "s3" | "cloudfront-public" | "none"
const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION || "us-east-1";
const CDN_BASE = process.env.CDN_BASE_URL; // e.g. https://dxxxx.cloudfront.net

const s3 = new S3Client({ region: REGION });

export async function signKey(key, ttlSeconds = 3600) {
  if (!key) return null;
  if (MODE === "none") return null;
  if (MODE === "cloudfront-public") {
    if (!CDN_BASE) return null;
    // Public CloudFront over private bucket via OAI/OPA is typical; URLs don’t need per-object signing
    return `${CDN_BASE}/${encodeURI(key)}`;
  }
  // default: S3 presigned GET
  if (!BUCKET) return null;
  if (process.env.DEBUG) {
    console.debug('[mediaSigner] signing', { key, mode: MODE, bucket: BUCKET, region: REGION, expiresIn: ttlSeconds });
  }
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3, cmd, { expiresIn: ttlSeconds });
}

export async function signKeys(keys = [], ttlSeconds = 3600) {
  const arr = Array.isArray(keys) ? keys : [];
  const signed = await Promise.all(arr.map(k => signKey(k, ttlSeconds)));
  return signed.filter(Boolean);
}

// One-time startup advisory about VPC endpoint or Org restrictions that can break presigned GETs
if (!global.__MEDIA_SIGNER_POLICY_NOTE_EMITTED__) {
  global.__MEDIA_SIGNER_POLICY_NOTE_EMITTED__ = true;
  const vpce = process.env.S3_VPC_ENDPOINT_ID;
  const restrictVpce = process.env.RESTRICT_TO_VPC_ENDPOINT;
  if (process.env.DEBUG) {
    console.debug('[mediaSigner:policy]', {
      vpce,
      restrictVpce,
      orgId: process.env.AWS_PRINCIPAL_ORG_ID || null
    });
    console.debug('[mediaSigner:warning]', 'If bucket policy enforces aws:SourceVpce or aws:PrincipalOrgID conditions, presigned URLs from public clients may 403. Prefer CloudFront with OAC for reads or relax policy for presigned GET.');
  }
}

export default { signKey, signKeys };


