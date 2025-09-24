import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { tenantScope, requireSameSchool } from '../middleware/tenancy.js';
import { presignAnnouncementUpload } from '../services/uploads.js';

const r = Router();

r.post('/presign', requireAuth, tenantScope, requireSameSchool, async (req, res) => {
  try {
    const { mimeType, size } = req.body || {};
    if (Number(size) > 5*1024*1024) return res.status(400).json({ message: 'File too large (max 5MB)' });
    const schoolId = req.context?.schoolId ?? req.user.school_id;

    const result = await presignAnnouncementUpload({ schoolId, mimeType });
    return res.json(result);
  } catch (err) {
    console.error('presign failed', err);
    return res.status(500).json({ message: err.message || 'presign failed' });
  }
});

export default r;
