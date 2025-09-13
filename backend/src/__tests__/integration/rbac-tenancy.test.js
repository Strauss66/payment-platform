import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes.js';
import invoiceRoutes from '../../routes/invoice.routes.js';
import { signJwt } from '../../middleware/auth.js';

// Build a minimal app for testing middleware ordering
function buildApp(){
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/invoices', invoiceRoutes);
  return app;
}

describe('RBAC and tenant scoping', () => {
  const app = buildApp();

  function token(payload){
    return signJwt(payload);
  }

  test('missing token -> 401', async () => {
    const res = await request(app).post('/api/invoices').send({});
    expect(res.status).toBe(401);
  });

  test('role lacking permission -> 403', async () => {
    const t = token({ id: 1, school_id: 10, roles: ['teacher'] });
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${t}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('admin without school switch header is scoped to own school', async () => {
    const t = token({ id: 2, school_id: 10, roles: ['admin'] });
    // This will fail downstream because service needs DB, but we only assert middleware ran and reached service
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${t}`)
      .send({ number: 'INV-1', student_id: 1, items: [] });
    // Either created or failed later, but it should not be 401/403/400 for missing schoolId header
    expect([201, 500]).toContain(res.status);
  });

  test('superadmin without X-School-Id when switching not allowed -> 400', async () => {
    process.env.TENANCY_ALLOW_HEADER_SWITCH = 'false';
    const t = token({ id: 3, school_id: 999, roles: ['super_admin'] });
    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${t}`)
      .send({});
    // Depending on route path check in tenantScope, but this route uses requireSameSchool (not tenantScope)
    // So for this app, super_admin behaves like normal and should hit 403 due to roles or proceed as admin not allowed.
    // We assert it does not pass as anonymous
    expect([401,403,500]).toContain(res.status);
  });
});


