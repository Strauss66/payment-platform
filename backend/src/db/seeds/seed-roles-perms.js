import { sequelize, assertDb } from '../../config/db.js';
import { Role, Permission } from '../../models/index.js';

async function run() {
  await assertDb();

  const roles = [
    { key_name: 'admin', display_name: 'Administrator' },
    { key_name: 'cashier', display_name: 'Cashier' },
    { key_name: 'teacher', display_name: 'Teacher' },
    { key_name: 'student_parent', display_name: 'Student/Parent' }
  ];
  for (const r of roles)
    await Role.findOrCreate({ where: { key_name: r.key_name }, defaults: r });

  const perms = [
    { key_name: 'invoice.read', description: 'Read invoices' },
    { key_name: 'invoice.create', description: 'Create invoices' },
    { key_name: 'payment.create', description: 'Record payments' },
    { key_name: 'payment.refund', description: 'Issue refunds' }
  ];
  for (const p of perms)
    await Permission.findOrCreate({ where: { key_name: p.key_name }, defaults: p });

  console.log('✅ Seeded roles & permissions.');
  await sequelize.close();
  process.exit(0);
}

run().catch(err => { console.error('❌ seed-roles-perms failed:', err); process.exit(1); });