import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  // Use Default School created by tenancy bootstrap
  const [school] = await School.findOrCreate({
    where: { slug: 'default' },
    defaults: { name: 'Default School', slug: 'default' }
  });

  // Get roles
  const adminRole = await Role.findOne({ where: { key_name: 'admin' } });
  const cashierRole = await Role.findOne({ where: { key_name: 'cashier' } });
  const teacherRole = await Role.findOne({ where: { key_name: 'teacher' } });
  const studentParentRole = await Role.findOne({ where: { key_name: 'student_parent' } });

  if (!adminRole || !cashierRole || !teacherRole || !studentParentRole) {
    throw new Error('Roles not seeded. Run core seed (tenancy bootstrap) first to create roles.');
  }

  // Create test users
  const testUsers = [
    {
      email: 'cashier@default.local',
      username: 'cashier',
      password: 'Cashier123!',
      role: cashierRole
    },
    {
      email: 'teacher@default.local',
      username: 'teacher',
      password: 'Teacher123!',
      role: teacherRole
    },
    {
      email: 'student@default.local',
      username: 'student',
      password: 'Student123!',
      role: studentParentRole
    },
    {
      email: 'parent@default.local',
      username: 'parent',
      password: 'Parent123!',
      role: studentParentRole
    }
  ];

  for (const userData of testUsers) {
    const password_hash = await bcrypt.hash(userData.password, 10);
    let user = await User.findOne({ where: { email: userData.email } });
    let action = 'ensured';
    if (!user) {
      user = await User.create({
        email: userData.email,
        username: userData.username,
        password_hash,
        school_id: school.id
      });
      action = 'created';
    } else {
      // Ensure school and update password to the seed value for dev determinism
      await user.update({ school_id: school.id, password_hash });
      action = 'updated';
    }

    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: userData.role.id },
      defaults: { user_id: user.id, role_id: userData.role.id }
    });

    console.log(`✅ ${action.toUpperCase()}: ${userData.email} (${userData.username}) role=${userData.role.key_name}`);
  }

  console.log('\n🎯 Test Users Ensured:');
  console.log('SuperAdmin: root@tenancy.local / Passw0rd!');
  console.log('Default Admin: admin@default.local / Passw0rd!');
  console.log('Cashier: cashier@default.local / Cashier123!');
  console.log('Teacher: teacher@default.local / Teacher123!');
  console.log('Student: student@default.local / Student123!');
  console.log('Parent: parent@default.local / Parent123!');

  await sequelize.close();
  process.exit(0);
}

run().catch(err => { 
  console.error('❌ seed-test-users failed:', err); 
  process.exit(1); 
});
