import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  // Ensure roles
  const roleKeys = ['super_admin','admin','cashier','teacher','student_parent'];
  const roles = {};
  for (const key of roleKeys) {
    const display = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const [r] = await Role.findOrCreate({ where: { key_name: key }, defaults: { key_name: key, display_name: display } });
    roles[key] = r;
  }

  // Default school
  const [school] = await School.findOrCreate({
    where: { slug: 'default' },
    defaults: {
      name: 'Default School',
      slug: 'default',
      primary_color: '#2563eb',
      secondary_color: '#0ea5e9',
      is_active: true
    }
  });

  // Superadmin user - ensure+update pattern
  const suPassPlain = 'Passw0rd!';
  const suPass = await bcrypt.hash(suPassPlain, 10);
  let su = await User.findOne({ where: { email: 'root@tenancy.local' } });
  if (!su) {
    su = await User.create({ email: 'root@tenancy.local', username: 'root', password_hash: suPass, school_id: school.id });
  } else {
    await su.update({ password_hash: suPass, school_id: school.id });
  }
  await UserRole.findOrCreate({ where: { user_id: su.id, role_id: roles.super_admin.id }, defaults: { user_id: su.id, role_id: roles.super_admin.id } });

  // Default admin user - ensure+update pattern
  const adminPassPlain = 'Passw0rd!';
  const adminPass = await bcrypt.hash(adminPassPlain, 10);
  let admin = await User.findOne({ where: { email: 'admin@default.local' } });
  if (!admin) {
    admin = await User.create({ email: 'admin@default.local', username: 'admin', password_hash: adminPass, school_id: school.id });
  } else {
    await admin.update({ password_hash: adminPass, school_id: school.id });
  }
  await UserRole.findOrCreate({ where: { user_id: admin.id, role_id: roles.admin.id }, defaults: { user_id: admin.id, role_id: roles.admin.id } });

  console.log('✅ Tenancy bootstrap ensured');
  console.log('   School:', school.id, school.slug);
  console.log('   SuperAdmin: root@tenancy.local / Passw0rd!');
  console.log('   Admin: admin@default.local / Passw0rd! (school_id=' + school.id + ')');

  await sequelize.close();
  process.exit(0);
}

run().catch(err => { console.error('❌ seed-tenancy-bootstrap failed:', err); process.exit(1); });


