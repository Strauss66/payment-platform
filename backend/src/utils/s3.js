import { S3Client } from '@aws-sdk/client-s3';

export function getSchoolS3Client() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new S3Client({ region, credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined });
}

export function getSchoolBucketKey(school, key) {
  const bucket = school.s3_bucket || process.env.S3_BASE_BUCKET || 'weglon-schools';
  const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
  return { bucket, key: normalizedKey };
}

// Expected IAM policy reference (documentation only):
// - Policy should allow s3:CreateBucket, s3:PutObject, s3:HeadBucket on `${S3_BASE_BUCKET}*`
// - Attach least-privilege IAM role to the deployment/runtime


