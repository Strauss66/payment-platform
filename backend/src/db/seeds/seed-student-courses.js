import bcrypt from 'bcrypt';
import { sequelize, assertDb } from '../../config/db.js';
import { User, Student, Class, Enrollment, School, Role, UserRole } from '../../models/index.js';

async function run() {
  await assertDb();

  // Ensure test school exists (for consistency with other seeds)
  const [school] = await School.findOrCreate({
    where: { slug: 'default' },
    defaults: { name: 'Default School', slug: 'default', timezone: 'America/Denver' }
  });

  const email = 'student@default.local';
  let user = await User.findOne({ where: { email } });
  if (!user) {
    const password_hash = await bcrypt.hash('Student123!', 10);
    user = await User.create({ email, username: 'student', password_hash, school_id: school.id });
    const studentParentRole = await Role.findOne({ where: { key_name: 'student_parent' } });
    if (!studentParentRole) {
      throw new Error('Role dependency missing: student_parent. Run core seed first.');
    }
    await UserRole.findOrCreate({ where: { user_id: user.id, role_id: studentParentRole.id }, defaults: { user_id: user.id, role_id: studentParentRole.id } });
  }

  // Ensure a Student record exists for this user
  let student = await Student.findOne({ where: { user_id: user.id } });
  if (!student) {
    const firstName = user.username || (user.email ? user.email.split('@')[0] : 'Student');
    student = await Student.create({
      user_id: user.id,
      school_id: user.school_id,
      first_name: firstName,
      last_name: '',
      grade: '10'
    });
  }

  const classNames = [
    'Mathematics 101',
    'English Literature',
    'Biology & Life Sciences'
  ];

  const classes = [];
  for (const name of classNames) {
    const [klass] = await Class.findOrCreate({
      where: { name },
      defaults: { name }
    });
    classes.push(klass);
  }

  for (const klass of classes) {
    await Enrollment.findOrCreate({
      where: { student_id: student.id, class_id: klass.id },
      defaults: { student_id: student.id, class_id: klass.id }
    });
  }

  console.log('✅ Ensured sample classes and enrollments for', email);
  console.log('   Classes:', classes.map(c => c.name).join(', '));

  await sequelize.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ seed-student-courses failed:', err);
  process.exit(1);
});


