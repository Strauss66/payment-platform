import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { sequelize, assertDb } from '../../config/db.js';
import { School, User, Role, UserRole, Student, Class, Enrollment } from '../../models/index.js';

// Helper: random utilities
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(array, count) {
  const copy = [...array];
  const chosen = [];
  while (copy.length && chosen.length < count) {
    const idx = randomInt(0, copy.length - 1);
    chosen.push(copy.splice(idx, 1)[0]);
  }
  return chosen;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Names pool
const FIRST_NAMES = [
  'Sofia','Valentina','Regina','Camila','Ximena','Lucia','Emma','Maria','Ana','Natalia',
  'Santiago','Mateo','Sebastian','Leonardo','Matias','Diego','Daniel','Emiliano','Gael','Luis'
];

const LAST_NAMES = [
  'Garcia','Martinez','Lopez','Gonzalez','Hernandez','Perez','Sanchez','Ramirez','Cruz','Torres',
  'Flores','Rivera','Gomez','Diaz','Vazquez','Jimenez','Morales','Reyes','Ortiz','Chavez'
];

function generatePerson() {
  const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
  const last = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
  return { first, last };
}

async function generateUniqueEmail(baseFirst, baseLast, existingEmailsSet) {
  let attempt = 0;
  while (attempt < 50) {
    const rand = randomInt(100, 999);
    const local = `${slugify(baseFirst)}.${slugify(baseLast)}+${rand}`;
    const email = `${local}@test.mx`;
    if (!existingEmailsSet.has(email)) {
      const exists = await User.findOne({ where: { email } });
      if (!exists) {
        existingEmailsSet.add(email);
        return email;
      }
    }
    attempt += 1;
  }
  throw new Error('Email generation collision detected');
}

async function tableExists(tableName) {
  const [rows] = await sequelize.query("SHOW TABLES LIKE :t", { replacements: { t: tableName } });
  return rows.length > 0;
}

async function run() {
  await assertDb();

  const t = await sequelize.transaction();
  const emailSet = new Set();
  try {
    // Idempotency: hard-delete previous tenant data
    const existingSchool = await School.findOne({ where: { name: 'Monte Alban School' }, transaction: t, lock: t.LOCK.UPDATE });
    if (existingSchool) {
      const sid = existingSchool.id;

      // Billing tables if present
      const hasInvoices = await tableExists('invoices');
      const hasInvoiceItems = await tableExists('invoice_items');
      const hasPayments = await tableExists('payments');
      const hasPaymentAlloc = await tableExists('payment_allocations');
      const hasLateFees = await tableExists('late_fees');

      if (hasPaymentAlloc) {
        await sequelize.query('DELETE pa FROM payment_allocations pa JOIN invoices i ON i.id = pa.invoice_id WHERE i.school_id = :sid', { replacements: { sid }, transaction: t });
      }
      if (hasPayments) {
        await sequelize.query('DELETE FROM payments WHERE school_id = :sid', { replacements: { sid }, transaction: t });
      }
      if (hasInvoiceItems) {
        await sequelize.query('DELETE ii FROM invoice_items ii JOIN invoices i ON i.id = ii.invoice_id WHERE i.school_id = :sid', { replacements: { sid }, transaction: t });
      }
      if (hasLateFees) {
        await sequelize.query('DELETE FROM late_fees WHERE school_id = :sid', { replacements: { sid }, transaction: t });
      }
      if (hasInvoices) {
        await sequelize.query('DELETE FROM invoices WHERE school_id = :sid', { replacements: { sid }, transaction: t });
      }

      // Academic data
      await sequelize.query('DELETE e FROM enrollments e JOIN students s ON s.id = e.student_id WHERE s.school_id = :sid', { replacements: { sid }, transaction: t });
      await sequelize.query("DELETE FROM students WHERE school_id = :sid", { replacements: { sid }, transaction: t });

      // Classes created by this tenant (by name prefix)
      await sequelize.query("DELETE FROM classes WHERE name LIKE 'Monte Alban - %'", { transaction: t });

      // Users
      await sequelize.query('DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE school_id = :sid)', { replacements: { sid }, transaction: t });
      await sequelize.query('DELETE FROM users WHERE school_id = :sid', { replacements: { sid }, transaction: t });

      // Finally the School
      await sequelize.query('DELETE FROM schools WHERE id = :sid', { replacements: { sid }, transaction: t });
    }

    // Create school
    const school = await School.create({
      name: 'Monte Alban School',
      slug: 'monte-alban-school',
      subdomain: 'monte-alban',
      timezone: 'N. Virginia',
      is_active: true
    }, { transaction: t });

    // Ensure roles
    const roleKeys = ['super_admin','admin','cashier','teacher','student_parent'];
    const roles = {};
    for (const key of roleKeys) {
      const display = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const [r] = await Role.findOrCreate({ where: { key_name: key }, defaults: { key_name: key, display_name: display }, transaction: t });
      roles[key] = r;
    }
    const parentRole = roles['student_parent'];

    // Courses and sections (stored as classes with naming convention)
    const courseNames = [
      'Algebra I', 'Biology', 'World History', 'English Composition', 'Computer Science',
      'Art Elective', 'Music Elective'
    ];
    const sectionLabels = ['A', 'B'];

    const sections = [];
    for (const course of courseNames) {
      for (const sec of sectionLabels) {
        const name = `Monte Alban - ${course} - ${sec}`;
        const klass = await Class.create({ name }, { transaction: t });
        sections.push({ course, section: sec, class: klass });
      }
    }

    // Optional ClassSchedules if table exists
    const hasClassSchedules = await tableExists('class_schedules');
    if (hasClassSchedules) {
      // Generate deterministic but non-overlapping windows per section across Mon-Fri
      for (const s of sections) {
        const baseHour = 8 + randomInt(0, 3); // 08..11 start range for first block
        const durationMin = randomInt(50, 60);
        const days = s.section === 'A' ? [1,3,5] : [2,4]; // A: Mon/Wed/Fri, B: Tue/Thu
        for (let i = 0; i < days.length; i++) {
          const startH = baseHour + (i % 2); // stagger a bit
          const start = `${String(startH).padStart(2,'0')}:00:00`;
          const endH = startH + Math.floor(durationMin / 60);
          const endM = durationMin % 60;
          const end = `${String(endH).padStart(2,'0')}:${endM === 0 ? '00' : String(endM)}:00`;
          await sequelize.query(
            'INSERT INTO class_schedules (class_id, weekday, start_time, end_time) VALUES (:cid, :wd, :st, :et)',
            { replacements: { cid: s.class.id, wd: days[i], st: start, et: end }, transaction: t }
          );
        }
      }
    }

    // Students and Parents
    const students = [];
    const parentByStudentId = new Map();
    const gradesBy = ['9','10','11','12'];
    const perGrade = 6;
    for (let gi = 0; gi < gradesBy.length; gi++) {
      const grade = gradesBy[gi];
      for (let k = 0; k < perGrade; k++) {
        const { first, last } = generatePerson();
        const email = await generateUniqueEmail(first, last, emailSet);
        const password_hash = await bcrypt.hash('Student123!', 10);
        const user = await User.create({ email, username: `${slugify(first)}_${slugify(last)}`, password_hash, school_id: school.id }, { transaction: t });
        // Optional: grant student_parent role to enable portal access
        await UserRole.findOrCreate({ where: { user_id: user.id, role_id: parentRole.id }, defaults: { user_id: user.id, role_id: parentRole.id }, transaction: t });
        const student = await Student.create({ user_id: user.id, school_id: school.id, first_name: first, last_name: last, grade }, { transaction: t });
        students.push({ student, user });

        // Parents: default 1, sometimes 2
        const numParents = 1 + (Math.random() < 0.35 ? 1 : 0);
        const parentUsers = [];
        for (let p = 0; p < numParents; p++) {
          const pPerson = generatePerson();
          const pEmail = await generateUniqueEmail(pPerson.first, pPerson.last, emailSet);
          const pHash = await bcrypt.hash('Parent123!', 10);
          const pUser = await User.create({ email: pEmail, username: `${slugify(pPerson.first)}_${slugify(pPerson.last)}`, password_hash: pHash, school_id: school.id }, { transaction: t });
          if (parentRole) {
            await UserRole.findOrCreate({ where: { user_id: pUser.id, role_id: parentRole.id }, defaults: { user_id: pUser.id, role_id: parentRole.id }, transaction: t });
          }
          parentUsers.push(pUser);
        }

        // If there is a parents / student_parents schema, link them; else store on student record
        const hasParentsTable = await tableExists('parents');
        const hasStudentParentsTable = await tableExists('student_parents');
        if (hasParentsTable && hasStudentParentsTable) {
          for (const pu of parentUsers) {
            // Ensure a parent row exists for this user
            const [parentRow] = await sequelize.query('SELECT id FROM parents WHERE user_id = :uid LIMIT 1', { replacements: { uid: pu.id }, transaction: t });
            let parentId = parentRow?.[0]?.id;
            if (!parentId) {
              const res = await sequelize.query('INSERT INTO parents (user_id) VALUES (:uid)', { replacements: { uid: pu.id }, transaction: t });
              // MySQL returns an array; get last insert id via second element if available
              parentId = res?.[0]?.insertId;
            }
            await sequelize.query('INSERT INTO student_parents (student_id, parent_id) VALUES (:sid, :pid)', { replacements: { sid: student.id, pid: parentId }, transaction: t });
          }
        } else {
          // Fallback: maintain a readable guardian name
          const guardian = parentUsers.map(u => u.username).join(' & ');
          await student.update({ parent_guardian_name: guardian }, { transaction: t });
        }
        parentByStudentId.set(student.id, parentUsers);
      }
    }

    // Assertions: every student has at least one parent
    for (const s of students) {
      const parents = parentByStudentId.get(s.student.id) || [];
      if (!parents.length) {
        throw new Error(`Assertion failed: student ${s.student.id} has no parent`);
      }
    }

    // Enrollments: each student in 4–6 classes
    for (const s of students) {
      const howMany = randomInt(4, 6);
      const chosenSections = pickRandom(sections, howMany);
      for (const sec of chosenSections) {
        await Enrollment.create({ student_id: s.student.id, class_id: sec.class.id }, { transaction: t });
      }
    }

    // Grades if table exists
    const hasGrades = await tableExists('grades');
    if (hasGrades) {
      const gradeTypes = ['Quiz','Homework','Exam','Project'];
      for (const s of students) {
        const enrolls = await Enrollment.findAll({ where: { student_id: s.student.id }, transaction: t });
        for (const enr of enrolls) {
          const scores = [];
          for (let i = 0; i < 6; i++) {
            const type = gradeTypes[i % gradeTypes.length];
            const score = Math.round(Math.random() * 100) / 10; // 0.0 - 10.0
            scores.push(score);
            await sequelize.query(
              'INSERT INTO grades (student_id, class_id, enrollment_id, type, score) VALUES (:sid, :cid, :eid, :type, :score)',
              { replacements: { sid: s.student.id, cid: enr.class_id, eid: enr.id, type, score }, transaction: t }
            );
          }
          const avg = Math.round((scores.reduce((a,b)=>a+b,0) / scores.length) * 10) / 10;
          await sequelize.query(
            'INSERT INTO grades (student_id, class_id, enrollment_id, type, score) VALUES (:sid, :cid, :eid, :type, :score)',
            { replacements: { sid: s.student.id, cid: enr.class_id, eid: enr.id, type: 'Final', score: avg }, transaction: t }
          );
        }
      }
    }

    // Billing in MXN cents if tables exist
    const hasInv = await tableExists('invoices');
    const hasInvItems = await tableExists('invoice_items');
    const hasPays = await tableExists('payments');
    const hasPayAllocs = await tableExists('payment_allocations');

    const tuitionCents = 400000; // MXN $4,000.00
    const extraFeesPool = [
      { desc: 'Materials Fee', cents: 50000 },
      { desc: 'Transport Fee', cents: 30000 }
    ];

    const issuedInvoices = [];
    if (hasInv) {
      for (const s of students) {
        // Aug 2025 -> Jun 2026 (11 months)
        for (let m = 0; m < 11; m++) {
          const issue = dayjs('2025-08-01').add(m, 'month');
          const due = issue.add(1, 'month').startOf('month'); // 1st of next month
          // Create invoice base
          const [invRes] = await sequelize.query(
            'INSERT INTO invoices (school_id, student_id, number, status, due_at, created_at, updated_at, subtotal, discount_total, tax_total, total, balance) VALUES (:sid, :stud, :num, :status, :due, :created, :updated, 0, 0, 0, 0, 0)',
            { replacements: {
              sid: school.id,
              stud: s.student.id,
              num: `MA-${s.student.id}-${issue.format('YYYYMM')}`,
              status: 'issued',
              due: due.toDate(),
              created: issue.toDate(),
              updated: issue.toDate()
            }, transaction: t }
          );
          const invId = invRes?.insertId;

          let subtotal = 0; let discount = 0; let tax = 0; let total = 0; let balance = 0;
          subtotal += tuitionCents;
          total = subtotal - discount + tax;
          balance = total;

          if (hasInvItems) {
            await sequelize.query(
              'INSERT INTO invoice_items (invoice_id, description, qty, unit_price, discount_amount, tax_amount, line_total) VALUES (:iid, :desc, :qty, :unit, :disc, :tax, :line)',
              { replacements: { iid: invId, desc: 'Monthly Tuition', qty: 1, unit: tuitionCents, disc: 0, tax: 0, line: tuitionCents }, transaction: t }
            );
          }

          // Random extras 0-2 across the year
          if (hasInvItems && Math.random() < 0.5) {
            const extrasCount = randomInt(0, 2);
            const extras = pickRandom(extraFeesPool, extrasCount);
            for (const ex of extras) {
              subtotal += ex.cents;
              total += ex.cents;
              balance += ex.cents;
              await sequelize.query(
                'INSERT INTO invoice_items (invoice_id, description, qty, unit_price, discount_amount, tax_amount, line_total) VALUES (:iid, :desc, :qty, :unit, :disc, :tax, :line)',
                { replacements: { iid: invId, desc: ex.desc, qty: 1, unit: ex.cents, disc: 0, tax: 0, line: ex.cents }, transaction: t }
              );
            }
          }

          await sequelize.query(
            'UPDATE invoices SET subtotal = :sub, discount_total = :disc, tax_total = :tax, total = :tot, balance = :bal WHERE id = :iid',
            { replacements: { sub: subtotal, disc: discount, tax: tax, tot: total, bal: balance, iid: invId }, transaction: t }
          );

          // Payments: 0–2 partial payments within 0–20 days of due
          const payCount = randomInt(0, 2);
          let remaining = balance;
          if (hasPays && hasPayAllocs && payCount > 0) {
            for (let p = 0; p < payCount && remaining > 0; p++) {
              const payAmt = Math.min(remaining, Math.floor(remaining * (p === payCount - 1 ? 1 : Math.random() * 0.6 + 0.2)));
              const receivedAt = due.add(randomInt(0, 20), 'day').toDate();
              const [payRes] = await sequelize.query(
                'INSERT INTO payments (school_id, student_id, method, amount, status, received_at, created_at, updated_at) VALUES (:sid, :stud, :method, :amt, :status, :recv, :created, :updated)',
                { replacements: { sid: school.id, stud: s.student.id, method: 'cash', amt: payAmt, status: 'completed', recv: receivedAt, created: receivedAt, updated: receivedAt }, transaction: t }
              );
              const payId = payRes?.insertId;
              await sequelize.query('INSERT INTO payment_allocations (payment_id, invoice_id, amount) VALUES (:pid, :iid, :amt)', { replacements: { pid: payId, iid: invId, amt: payAmt }, transaction: t });
              remaining -= payAmt;
            }
            // Update invoice balance/status
            const newStatus = remaining <= 0 ? 'paid' : (remaining < total ? 'partial' : 'issued');
            await sequelize.query('UPDATE invoices SET balance = :bal, status = :st WHERE id = :iid', { replacements: { bal: Math.max(0, remaining), st: newStatus, iid: invId }, transaction: t });
          }

          // Late fees: apply compounding 1.5% monthly on past-due amounts (simple approximation)
          if (hasInvItems) {
            const asOf = dayjs('2026-07-01');
            let months = Math.max(0, asOf.diff(due, 'month'));
            let runningBalance = remaining;
            for (let lm = 0; lm < months && runningBalance > 0; lm++) {
              const fee = Math.ceil(runningBalance * 0.015);
              runningBalance += fee;
              await sequelize.query(
                'INSERT INTO invoice_items (invoice_id, description, qty, unit_price, discount_amount, tax_amount, line_total) VALUES (:iid, :desc, 1, :fee, 0, 0, :fee)',
                { replacements: { iid: invId, desc: 'Late fee (1.5%)', fee }, transaction: t }
              );
            }
            if (runningBalance !== remaining) {
              await sequelize.query('UPDATE invoices SET balance = :bal, total = total + (:bal - :prev) WHERE id = :iid', { replacements: { bal: Math.ceil(runningBalance), prev: remaining, iid: invId }, transaction: t });
            }
          }

          issuedInvoices.push({ student_id: s.student.id });
        }
      }
    }

    // Create Monte-specific Admin and Cashier users for visibility
    const adminPass = await bcrypt.hash('Passw0rd!', 10);
    const cashierPass = await bcrypt.hash('Cashier123!', 10);
    const [monteAdmin] = await User.findOrCreate({
      where: { email: 'admin@montealban.local' },
      defaults: { email: 'admin@montealban.local', username: 'monte_admin', password_hash: adminPass, school_id: school.id },
      transaction: t
    });
    await UserRole.findOrCreate({ where: { user_id: monteAdmin.id, role_id: roles.admin.id }, defaults: { user_id: monteAdmin.id, role_id: roles.admin.id }, transaction: t });
    const [monteCashier] = await User.findOrCreate({
      where: { email: 'cashier@montealban.local' },
      defaults: { email: 'cashier@montealban.local', username: 'monte_cashier', password_hash: cashierPass, school_id: school.id },
      transaction: t
    });
    await UserRole.findOrCreate({ where: { user_id: monteCashier.id, role_id: roles.cashier.id }, defaults: { user_id: monteCashier.id, role_id: roles.cashier.id }, transaction: t });

    // Ensure SuperAdmin and Default Admin can switch or view this tenant easily (optional)
    try {
      const superAdmin = await User.findOne({ where: { email: 'root@tenancy.local' }, transaction: t, lock: t.LOCK.UPDATE });
      if (superAdmin) {
        await superAdmin.update({ school_id: school.id }, { transaction: t });
        await UserRole.findOrCreate({ where: { user_id: superAdmin.id, role_id: roles.super_admin.id }, defaults: { user_id: superAdmin.id, role_id: roles.super_admin.id }, transaction: t });
      }
    } catch {}
    try {
      const defaultAdmin = await User.findOne({ where: { email: 'admin@default.local' }, transaction: t, lock: t.LOCK.UPDATE });
      if (defaultAdmin) {
        await defaultAdmin.update({ school_id: school.id }, { transaction: t });
        await UserRole.findOrCreate({ where: { user_id: defaultAdmin.id, role_id: roles.admin.id }, defaults: { user_id: defaultAdmin.id, role_id: roles.admin.id }, transaction: t });
      }
    } catch {}

    // Commit data
    await t.commit();

    // Summary output
    const studentsCount = students.length;
    const parentsCount = Array.from(parentByStudentId.values()).reduce((a, arr) => a + arr.length, 0);
    const classesCount = sections.length;
    const enrollmentsCount = await Enrollment.count();
    const invoicesCount = hasInv ? issuedInvoices.length : 0;

    console.log('✅ Monte Alban tenant seeded');
    console.log(' - School: Monte Alban School');
    console.log(` - Students: ${studentsCount}`);
    console.log(` - Parents: ${parentsCount}`);
    console.log(` - Classes (sections): ${classesCount}`);
    console.log(` - Enrollments: ${enrollmentsCount}`);
    if (hasInv) console.log(` - Invoices: ${invoicesCount}`);

    // Sample snapshot for first student
    const sample = students[0];
    const sampleParents = (parentByStudentId.get(sample.student.id) || []).map(u => u.email);
    const sampleEnrolls = await Enrollment.findAll({ where: { student_id: sample.student.id }, include: [{ model: Class, as: 'class' }] });
    const sampleClasses = sampleEnrolls.map(e => e.class?.name || e.class_id);

    let currentBalance = 'n/a';
    if (hasInv) {
      const [rows] = await sequelize.query('SELECT SUM(balance) as bal FROM invoices WHERE student_id = :sid', { replacements: { sid: sample.student.id } });
      currentBalance = rows?.[0]?.bal ?? 0;
      if (typeof currentBalance === 'number') {
        currentBalance = `MXN $${(currentBalance/100).toFixed(2)}`;
      }
    }

    console.log(' - Sample Student Snapshot:');
    console.log(`   Name: ${sample.student.first_name} ${sample.student.last_name} (grade ${sample.student.grade})`);
    console.log(`   Parents: ${sampleParents.join(', ')}`);
    console.log(`   Classes: ${sampleClasses.join('; ')}`);
    console.log(`   Current Balance: ${currentBalance}`);

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('❌ Seed failed, rolled back:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

run();


