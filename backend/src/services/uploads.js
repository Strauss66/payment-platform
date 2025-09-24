import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getSchoolS3Client } from '../utils/s3.js';

// --- AWS S3 Presigned Upload Service ---
// This service generates presigned PUT URLs so the frontend can upload images directly to S3.
// 
// Required environment variables (in .env or instance role):
//   AWS_REGION           = us-east-1                    (S3 region)
//   S3_BUCKET            = weglon-app-uploads           (base bucket name)
//   AWS_ACCESS_KEY_ID    = <IAM access key>             (not needed if using IAM role)
//   AWS_SECRET_ACCESS_KEY= <IAM secret key>             (not needed if using IAM role)
//   AWS_SESSION_TOKEN    = <only if temporary STS creds> (optional, for STS tokens)
//
// Dev note: In development we currently use static IAM keys in `.env.dev`.
// In AWS production we should prefer IAM roles attached to EC2/ECS/Lambda instead of env keys.
//
// Upload Flow:
//   1. Frontend requests presigned URL for image upload
//   2. Backend creates a presigned PUT URL for S3 (valid 5 minutes)
//   3. Frontend uploads the file directly to S3 using that URL
//   4. Backend stores only the object key in the database (never public URLs)
//   5. For reads, we should return CloudFront signed GET URLs (see services/cf.js)
//
// Security reminders:
// - Never commit .env with keys to Git
// - Bucket is private (no public ACLs)
// - CloudFront distribution with signed URLs is the only way to serve images to clients
// - Presigned URLs expire after 5 minutes for security

const BUCKET = process.env.S3_BASE_BUCKET || process.env.S3_BUCKET;

/**
 * Generates a presigned URL for uploading announcement images to S3
 * @param {Object} params - Upload parameters
 * @param {string} params.schoolId - School identifier for organizing files
 * @param {string} params.mimeType - MIME type of the image (must be png, jpeg, or webp)
 * @returns {Promise<{key: string, uploadUrl: string}>} Object with S3 key and presigned URL
 * @throws {Error} If mimeType is not a supported image format
 */
export async function presignAnnouncementUpload({ schoolId, mimeType }) {
  // Validate image format - only allow common web image formats
  if (!/^image\/(png|jpeg|webp)$/.test(mimeType)) {
    throw new Error('Invalid mime type. Only PNG, JPEG, and WebP images are allowed.');
  }
  
  // Determine file extension from MIME type
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  
  // Generate unique file path: schools/{schoolId}/announcements/{uuid}.{ext}
  const key = `schools/${schoolId}/announcements/${randomUUID()}.${ext}`;
  
  // Create S3 client and PUT command
  const s3 = getSchoolS3Client();
  const cmd = new PutObjectCommand({ 
    Bucket: BUCKET, 
    Key: key, 
    ContentType: mimeType 
  });
  
  // Generate presigned URL valid for 5 minutes
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  
  return { key, uploadUrl };
}
