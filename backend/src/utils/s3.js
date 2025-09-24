import { S3Client } from '@aws-sdk/client-s3';

// --- AWS / S3 Setup ---
// This utility creates S3 clients for direct uploads and file operations.
// 
// Required environment variables (in .env or instance role):
//   AWS_REGION           = us-east-1                    (S3 region)
//   S3_BUCKET            = weglon-app-uploads           (base bucket name)
//   AWS_ACCESS_KEY_ID    = AKIAUSC7JWCAERRSO2EH          (not needed if using IAM role)
//   AWS_SECRET_ACCESS_KEY= <IAM secret key>             (not needed if using IAM role)
//   AWS_SESSION_TOKEN    = <only if temporary STS creds> (optional, for STS tokens)
//
// Dev note: In development we currently use static IAM keys in `.env.dev`.
// In AWS production we should prefer IAM roles attached to EC2/ECS/Lambda instead of env keys.
//
// Flow:
//   1. Backend creates a presigned PUT URL for S3 (valid 5 minutes).
//   2. Frontend uploads the file directly to S3 using that URL.
//   3. Backend stores only the object key in the database (never public URLs).
//   4. For reads, we should return CloudFront signed GET URLs (see services/cf.js).
//
// Security reminders:
// - Never commit .env with keys to Git.
// - Bucket is private (no public ACLs).
// - CloudFront distribution with signed URLs is the only way to serve images to clients.
// - IAM roles are preferred over static credentials in production.

export function getSchoolS3Client() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new S3Client({ 
    region, 
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      // AWS_SESSION_TOKEN is automatically used if present in environment
    } : undefined // Falls back to default credential chain (IAM roles, AWS CLI, etc.)
  });
}

export function getSchoolBucketKey(school, key) {
  const bucket = school.s3_bucket || process.env.S3_BASE_BUCKET || 'weglon-schools';
  const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
  return { bucket, key: normalizedKey };
}

// Expected IAM policy reference (documentation only):
// - Policy should allow s3:CreateBucket, s3:PutObject, s3:HeadBucket on `${S3_BASE_BUCKET}*`
// - Attach least-privilege IAM role to the deployment/runtime


