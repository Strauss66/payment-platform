import { Router } from 'express';
import { DashboardLayout } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// GET /api/dashboard/layouts/:view - get saved layout for current user/school
r.get('/layouts/:view', requireAuth, async (req, res) => {
  try {
    const { view } = req.params;
    const layout = await DashboardLayout.findOne({
      where: { user_id: req.user.id, school_id: req.user.school_id, view }
    });
    if (!layout) return res.json({ view, layout: [] });
    return res.json({ view, layout: JSON.parse(layout.layout_json) });
  } catch (err) {
    console.error('Error fetching dashboard layout:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/dashboard/layouts/:view - upsert layout for current user/school
r.put('/layouts/:view', requireAuth, async (req, res) => {
  try {
    const { view } = req.params;
    const { layout } = req.body; // expected array from react-grid-layout
    if (!Array.isArray(layout)) return res.status(400).json({ message: 'Invalid layout format' });

    const payload = {
      user_id: req.user.id,
      school_id: req.user.school_id,
      view,
      layout_json: JSON.stringify(layout)
    };

    // upsert on (user_id, school_id, view)
    const [record] = await DashboardLayout.upsert(payload, { returning: true });
    return res.json({ view, layout: JSON.parse(record.layout_json) });
  } catch (err) {
    console.error('Error saving dashboard layout:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;


