// backend/scripts/seed-tenants.js
import { assertSafeDb } from '../src/utils/safety.js';

async function main() {
  assertSafeDb();
  // Demo tenants with branding + users/students/invoices per school
  await import('../src/db/seeds/seed-tenancy-bootstrap.js');
  // Reuse existing seeds for demo data; can be expanded with invoices later
  await import('../src/db/seeds/seed-test-users.js');
  await import('../src/db/seeds/seed-student-courses.js');
}

main().catch(err => { console.error(err); process.exit(1); });


