import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  // Get or create school
  const [school] = await School.findOrCreate({
    where: { name: 'Weglon Test School' },
    defaults: { timezone: 'America/Denver' }
  });

  // Get roles
  const adminRole = await Role.findOne({ where: { key_name: 'admin' } });
  const cashierRole = await Role.findOne({ where: { key_name: 'cashier' } });
  const teacherRole = await Role.findOne({ where: { key_name: 'teacher' } });
  const studentParentRole = await Role.findOne({ where: { key_name: 'student_parent' } });

  // Create test users
  const testUsers = [
    {
      email: 'admin@weglon.test',
      username: 'admin',
      password: 'Admin123!',
      role: adminRole
    },
    {
      email: 'cashier@weglon.test',
      username: 'cashier',
      password: 'Cashier123!',
      role: cashierRole
    },
    {
      email: 'teacher@weglon.test',
      username: 'teacher',
      password: 'Teacher123!',
      role: teacherRole
    },
    {
      email: 'student@weglon.test',
      username: 'student',
      password: 'Student123!',
      role: studentParentRole
    },
    {
      email: 'parent@weglon.test',
      username: 'parent',
      password: 'Parent123!',
      role: studentParentRole
    }
  ];

  for (const userData of testUsers) {
    const password_hash = await bcrypt.hash(userData.password, 10);
    
    const [user] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: {
        email: userData.email,
        username: userData.username,
        password_hash,
        school_id: school.id
      }
    });

    // Assign role
    await UserRole.findOrCreate({
      where: { user_id: user.id, role_id: userData.role.id },
      defaults: { user_id: user.id, role_id: userData.role.id }
    });

    console.log(`✅ Created user: ${userData.email} (${userData.username}) with role: ${userData.role.key_name}`);
  }

  console.log('\n🎯 Test Users Created:');
  console.log('Admin: admin@weglon.test / Admin123!');
  console.log('Cashier: cashier@weglon.test / Cashier123!');
  console.log('Teacher: teacher@weglon.test / Teacher123!');
  console.log('Student: student@weglon.test / Student123!');
  console.log('Parent: parent@weglon.test / Parent123!');

  await sequelize.close();
  process.exit(0);
}

run().catch(err => { 
  console.error('❌ seed-test-users failed:', err); 
  process.exit(1); 
});
