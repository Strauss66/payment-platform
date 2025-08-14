// backend/scripts/seed-core.js
import { assertSafeDb } from '../src/utils/safety.js';

async function main() {
  assertSafeDb();
  // Day-one core seeds (deterministic): roles, default school, superadmin, one admin
  await import('../src/db/seeds/seed-roles-perms.js');
  await import('../src/db/seeds/seed-tenancy-bootstrap.js');
  await import('../src/db/seeds/seed-super-admin.js');
}

main().catch(err => { console.error(err); process.exit(1); });


