import { sequelize, assertDb } from '../../config/db.js';
import { User, Student, Class, Enrollment, School } from '../../models/index.js';

async function run() {
  await assertDb();

  // Ensure test school exists (for consistency with other seeds)
  await School.findOrCreate({
    where: { name: 'Weglon Test School' },
    defaults: { timezone: 'America/Denver' }
  });

  const email = 'student@weglon.test';
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.error(`❌ Test user not found: ${email}. Run seed-test-users first.`);
    process.exit(1);
  }

  // Ensure a Student record exists for this user
  let student = await Student.findOne({ where: { user_id: user.id } });
  if (!student) {
    const firstName = user.username || (user.email ? user.email.split('@')[0] : 'Student');
    student = await Student.create({
      user_id: user.id,
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

  console.log('✅ Seeded sample classes and enrollments for', email);
  console.log('   Classes:', classes.map(c => c.name).join(', '));

  await sequelize.close();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ seed-student-courses failed:', err);
  process.exit(1);
});


