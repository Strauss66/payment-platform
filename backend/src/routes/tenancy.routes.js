import { Router } from 'express';
import { Op } from 'sequelize';
import { requireAuth } from '../middleware/auth.js';
import { tenantScope, withSchool } from '../middleware/tenancy.js';
import { ROLES } from '../utils/roles.js';
import { School, UserRole, Role, User } from '../models/index.js';
import { S3Client, CreateBucketCommand, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const r = Router();

function ensureSuperadmin(req, res, next) {
  const roles = req.user?.roles || [];
  if (!roles.includes(ROLES.SUPER_ADMIN)) return res.status(403).json({ message: 'Forbidden' });
  return next();
}

function getS3Client() {
  const region = process.env.AWS_REGION || 'us-east-1';
  return new S3Client({ region, credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined });
}

function getSchoolBucketName(slug) {
  const base = process.env.S3_BASE_BUCKET || 'weglon-schools';
  return `${base}-${slug}`;
}

// POST /schools (superadmin): create school + S3 bucket
r.post('/schools', requireAuth, tenantScope, ensureSuperadmin, async (req, res) => {
  try {
    const { name, slug, subdomain, primary_color, secondary_color } = req.body || {};
    if (!slug || !/^[a-z0-9-]{3,}$/.test(slug)) return res.status(400).json({ message: 'Invalid slug' });
    if (subdomain && !/^[a-z0-9-]{3,}$/.test(subdomain)) return res.status(400).json({ message: 'Invalid subdomain' });

    // Create or validate bucket
    let bucket = getSchoolBucketName(slug);
    const s3 = getS3Client();
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
      } catch (err) {
        // fallback: use base bucket with folder
        const base = process.env.S3_BASE_BUCKET || 'weglon-schools';
        try {
          await s3.send(new HeadBucketCommand({ Bucket: base }));
        } catch {
          await s3.send(new CreateBucketCommand({ Bucket: base }));
        }
        // use base bucket and later store objects under slug/ prefix
        bucket = base;
        console.warn(JSON.stringify({ level: 'warn', msg: 'S3 bucket-per-school creation failed; using folder-per-school', slug, base_bucket: base }));
      }
    }

    const school = await School.create({ name, slug, subdomain, primary_color, secondary_color, s3_bucket: bucket, is_active: true });
    return res.status(201).json({ id: school.id, slug: school.slug, s3_bucket: school.s3_bucket });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Slug/subdomain/bucket must be unique' });
    }
    console.error('create school failed', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// GET /schools (superadmin)
r.get('/schools', requireAuth, tenantScope, ensureSuperadmin, async (req, res) => {
  const { is_active, q, limit = 50, offset = 0 } = req.query;
  const where = {};
  if (typeof is_active !== 'undefined') where.is_active = String(is_active) === 'true';
  if (q) where.name = { [Op.like]: `%${q}%` };
  const rows = await School.findAndCountAll({ where, limit: Number(limit), offset: Number(offset), order: [['id','DESC']] });
  res.json(rows);
});

// GET /schools/:id (superadmin)
r.get('/schools/:id', requireAuth, tenantScope, ensureSuperadmin, async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) return res.status(404).json({ message: 'Not found' });
  res.json(school);
});

// PATCH /schools/:id (superadmin)
r.patch('/schools/:id', requireAuth, tenantScope, ensureSuperadmin, async (req, res) => {
  const school = await School.findByPk(req.params.id);
  if (!school) return res.status(404).json({ message: 'Not found' });
  const updatable = ['name','subdomain','primary_color','secondary_color','is_active'];
  const changes = {};
  for (const k of updatable) if (k in req.body) changes[k] = req.body[k];
  if (changes.subdomain && !/^[a-z0-9-]{3,}$/.test(changes.subdomain)) return res.status(400).json({ message: 'Invalid subdomain' });
  await school.update(changes);
  res.json(school);
});

// POST /schools/:id/branding/logo (superadmin or admin of that school)
r.post('/schools/:id/branding/logo', requireAuth, tenantScope, async (req, res) => {
  try {
    const roles = req.user?.roles || [];
    const isSuper = roles.includes(ROLES.SUPER_ADMIN);
    const school = await School.findByPk(req.params.id);
    if (!school) return res.status(404).json({ message: 'Not found' });
    if (!isSuper && req.user.school_id !== school.id) return res.status(403).json({ message: 'Forbidden' });

    let buffer = null;
    let contentType = 'image/png';
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      // very minimal multipart parser fallback: rely on express.raw not configured; skip full support
      return res.status(415).json({ message: 'multipart not supported in this minimal build; send imageBase64' });
    } else {
      const { imageBase64 } = req.body || {};
      if (!imageBase64) return res.status(400).json({ message: 'imageBase64 is required' });
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const s3 = getS3Client();
    const bucket = school.s3_bucket || getSchoolBucketName(school.slug);
    const key = bucket === (process.env.S3_BASE_BUCKET || 'weglon-schools') ? `${school.slug}/branding/logo.png` : 'branding/logo.png';
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType, CacheControl: 'public, max-age=3600' }));
    const region = process.env.AWS_REGION || 'us-east-1';
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    await school.update({ logo_url: url });
    res.json({ logo_url: url });
  } catch (err) {
    console.error('logo upload failed', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// GET /me/school (any authenticated)
r.get('/me/school', requireAuth, tenantScope, async (req, res) => {
  const schoolId = req.context?.schoolId || req.user?.school_id;
  if (!schoolId) return res.json(null);
  const school = await School.findByPk(schoolId);
  if (!school) return res.status(404).json({ message: 'Not found' });
  res.json({ id: school.id, name: school.name, slug: school.slug, primary_color: school.primary_color, secondary_color: school.secondary_color, logo_url: school.logo_url });
});

export default r;


