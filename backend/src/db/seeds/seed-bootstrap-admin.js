import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  const [school] = await School.findOrCreate({
    where: { slug: 'weglon-test-school' },
    defaults: { name: 'Weglon Test School', slug: 'weglon-test-school', timezone: 'America/Denver' }
  });

  const password_hash = await bcrypt.hash('Admin123!', 10);
  const [user] = await User.findOrCreate({
    where: { email: 'admin@weglon.test', school_id: school.id },
    defaults: { email: 'admin@weglon.test', username: 'admin', password_hash, school_id: school.id }
  });

  // Ensure user_schools mapping and default_school_id
  await sequelize.query(
    'INSERT INTO user_schools (user_id, school_id, is_primary, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())\n     ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary), updated_at = NOW()',
    { replacements: [user.id, school.id] }
  );
  await user.update({ default_school_id: school.id });

  const adminRole = await Role.findOne({ where: { key_name: 'admin' } });
  await UserRole.findOrCreate({
    where: { user_id: user.id, role_id: adminRole.id },
    defaults: { user_id: user.id, role_id: adminRole.id }
  });

  // Also ensure a super_admin role is present and assigned to bootstrap admin if desired
  const superAdminRole = await Role.findOne({ where: { key_name: 'super_admin' } });
  if (superAdminRole) {
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: superAdminRole.id },
      defaults: { user_id: user.id, role_id: superAdminRole.id }
    });
  }

  console.log(`✅ Bootstrap admin -> email=admin@weglon.test  password=Admin123!  roles=[admin${superAdminRole ? ', super_admin' : ''}]  school_id=${school.id}`);
  await sequelize.close();
  process.exit(0);
}

run().catch(err => { console.error('❌ seed-bootstrap-admin failed:', err); process.exit(1); });