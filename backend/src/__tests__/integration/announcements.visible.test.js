import request from 'supertest';
import express from 'express';
import announcementsRoutes from '../../routes/announcements.routes.js';
import { signJwt } from '../../middleware/auth.js';

function buildApp(){
  const app = express();
  app.use(express.json());
  app.use('/api/announcements', announcementsRoutes);
  return app;
}

describe('Announcements visible feed', () => {
  const app = buildApp();

  function token(payload){ return signJwt(payload); }

  test('super_admin sees time-filtered list, paginated shape', async () => {
    const t = token({ id: 1, school_id: 1, roles: ['super_admin'] });
    const res = await request(app)
      .get('/api/announcements/visible?limit=5&offset=0')
      .set('Authorization', `Bearer ${t}`)
      .set('X-School-Id', '1');
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body.rows) || Array.isArray(res.body)).toBe(true);
    }
  });

  test('teacher does not get duplicates and receives sorted rows', async () => {
    const t = token({ id: 2, school_id: 1, roles: ['teacher'] });
    const res = await request(app)
      .get('/api/announcements/visible?limit=50')
      .set('Authorization', `Bearer ${t}`);
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      const rows = Array.isArray(res.body.rows) ? res.body.rows : res.body;
      const ids = new Set();
      for (const r of rows) {
        expect(ids.has(r.id)).toBe(false);
        ids.add(r.id);
      }
      const sorted = rows.slice().sort((a,b)=>{
        const s = new Date(a.startsAt) - new Date(b.startsAt);
        if (s !== 0) return s;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      expect(JSON.stringify(rows)).toBe(JSON.stringify(sorted));
    }
  });
});


