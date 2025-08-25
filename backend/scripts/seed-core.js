// backend/scripts/seed-core.js
import { assertSafeDb } from '../src/utils/safety.js';
import seedCoreRbac from '../src/db/seeds/seed-2-1-core-rbac.js';
import seedSchoolsAndPrefs from '../src/db/seeds/seed-2-2-schools-prefs.js';
import seedUsers from '../src/db/seeds/seed-2-3-users.js';
import seedBasics from '../src/db/seeds/seed-2-4-basics.js';
import seedFamiliesStudents from '../src/db/seeds/seed-2-5-families-students.js';
import seedBilling from '../src/db/seeds/seed-2-6-billing.js';

async function main() {
  assertSafeDb();
  // Step 2 ordered seeds (idempotent)
  await seedCoreRbac();
  await seedSchoolsAndPrefs();
  await seedUsers();
  await seedBasics();
  await seedFamiliesStudents();
  await seedBilling();
}

main().catch(err => { console.error(err); process.exit(1); });


