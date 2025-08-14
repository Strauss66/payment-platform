import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  const [school] = await School.findOrCreate({
    where: { name: 'Weglon Test School' },
    defaults: { timezone: 'America/Denver' }
  });

  const password_hash = await bcrypt.hash('Superadmin123!', 10);
  const [user] = await User.findOrCreate({
    where: { email: 'superadmin@weglon.test', school_id: school.id },
    defaults: { email: 'superadmin@weglon.test', username: 'superadmin', password_hash, school_id: school.id }
  });

  const superAdminRole = await Role.findOne({ where: { key_name: 'super_admin' } });
  if (!superAdminRole) {
    console.warn('⚠️ super_admin role not found. Run roles seeder first.');
  } else {
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: superAdminRole.id },
      defaults: { user_id: user.id, role_id: superAdminRole.id }
    });
  }

  // Optionally also give admin role
  const adminRole = await Role.findOne({ where: { key_name: 'admin' } });
  if (adminRole) {
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: adminRole.id },
      defaults: { user_id: user.id, role_id: adminRole.id }
    });
  }

  console.log(`✅ Superadmin created -> email=superadmin@weglon.test password=Superadmin123! roles=[super_admin${adminRole ? ', admin' : ''}] school_id=${school.id}`);
  await sequelize.close();
  process.exit(0);
}

run().catch(err => { console.error('❌ seed-super-admin failed:', err); process.exit(1); });


