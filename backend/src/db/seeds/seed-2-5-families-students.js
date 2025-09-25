import { sequelize } from '../../config/db.js';

function range(n) { return Array.from({ length: n }, (_, i) => i); }

export default async function seedFamiliesStudents() {
  const t = await sequelize.transaction();
  try {
    const [[school]] = await sequelize.query('SELECT id FROM schools WHERE slug = "weglon-test-school"', { transaction: t });
    if (!school) throw new Error('Weglon Test School not found');

    // 6 demo families
    const familyIds = [];
    for (const i of range(6)) {
      const code = `FAM${(i+1).toString().padStart(3,'0')}`;
      await sequelize.query(
        'INSERT INTO families (school_id, code, surname, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE surname=VALUES(surname), updated_at=NOW()',
        { replacements: [school.id, code, `Surname${i+1}`], transaction: t }
      );
      const [[fam]] = await sequelize.query('SELECT id FROM families WHERE school_id=? AND code=?', { replacements: [school.id, code], transaction: t });
      familyIds.push(fam.id);
    }

    // 1–2 guardians per family (idempotent)
    for (const fid of familyIds) {
      for (const j of range(2)) {
        const isPrimary = j === 0 ? 1 : 0;
        const first = `Parent${fid}-${j+1}`;
        const last = `Surname${fid}`;
        await sequelize.query(
          'INSERT INTO parents (school_id, family_id, first_name, last_name, email, phone, is_primary_guardian, created_at, updated_at)\n           SELECT ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()\n           WHERE NOT EXISTS (SELECT 1 FROM parents WHERE school_id=? AND family_id=? AND first_name=? AND last_name=?)',
          { replacements: [school.id, fid, first, last, null, null, isPrimary, school.id, fid, first, last], transaction: t }
        );
      }
    }

    // 24 demo students across grades 9–12
    let studentCounter = 0;
    for (const grade of [9,10,11,12]) {
      for (const k of range(6)) {
        const famId = familyIds[k % familyIds.length];
        const firstName = `Student${++studentCounter}`;
        const lastName = `Surname${famId}`;
        // Insert only columns that exist in current schema; ensure idempotency by checking for existing first/last/grade tuple
        await sequelize.query(
          'INSERT INTO students (school_id, first_name, last_name, age, address, parent_guardian_name, grade, balance, late_fees)\n           SELECT ?, ?, ?, NULL, NULL, NULL, ?, 0.00, 0.00\n           WHERE NOT EXISTS (SELECT 1 FROM students WHERE school_id=? AND first_name=? AND last_name=? AND grade=?)',
          { replacements: [school.id, firstName, lastName, String(grade), school.id, firstName, lastName, String(grade)], transaction: t }
        );
      }
    }

    await t.commit();
    console.log('✅ Seeded demo families and 24 HS students');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed families/students failed:', err.message);
    throw err;
  }
}

export async function up() { return seedFamiliesStudents(); }
export async function down() { /* no-op */ }


