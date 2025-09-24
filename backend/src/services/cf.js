import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export function signCdnUrlForKey(key, ttlSeconds = 900) {
  const base = process.env.CLOUDFRONT_DIST_URL; // e.g., https://dxxxxx.cloudfront.net
  const keyPairId = process.env.CF_KEY_PAIR_ID;
  const privateKeyBase64 = process.env.CF_PRIVATE_KEY_BASE64;

  if (!base || !keyPairId || !privateKeyBase64) {
    throw new Error('CloudFront signing not configured: set CLOUDFRONT_DIST_URL, CF_KEY_PAIR_ID, CF_PRIVATE_KEY_BASE64');
  }

  const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf8');

  return getSignedUrl({
    url: `${base}/${key}`,
    keyPairId,
    dateLessThan: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    privateKey
  });
}
