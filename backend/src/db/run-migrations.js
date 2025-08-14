import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, assertDb } from '../config/db.js';
import { assertSafeDb } from '../../utils/safety.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  // Ensure we are operating on the correct database for the environment
  assertSafeDb();
  await assertDb();
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
  for (const f of files) {
    const mod = await import(path.join(dir, f));
    if (typeof mod.up === 'function') {
      console.log('▶ Running migration', f);
      await mod.up({});
    }
  }
  await sequelize.close();
  console.log('✅ Migrations complete');
}

run().catch(err => { console.error('❌ Migration error', err); process.exit(1); });


