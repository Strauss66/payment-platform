import { sequelize } from '../../config/db.js';

function range(n) { return Array.from({ length: n }, (_, i) => i); }

export default async function seedFamiliesStudents() {
  const t = await sequelize.transaction();
  try {
    const [[ma]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = "monte"', { transaction: t });
    const [[hs]] = await sequelize.query('SELECT id FROM levels WHERE school_id=? AND code="HS"', { replacements: [ma.id], transaction: t });
    if (!ma || !hs) throw new Error('Monte Albán/HS not found');

    // 6 demo families
    const familyIds = [];
    for (const i of range(6)) {
      const code = `FAM${(i+1).toString().padStart(3,'0')}`;
      await sequelize.query(
        'INSERT INTO families (school_id, code, surname, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE surname=VALUES(surname), updated_at=NOW()',
        { replacements: [ma.id, code, `Surname${i+1}`], transaction: t }
      );
      const [[fam]] = await sequelize.query('SELECT id FROM families WHERE school_id=? AND code=?', { replacements: [ma.id, code], transaction: t });
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
          { replacements: [ma.id, fid, first, last, null, null, isPrimary, ma.id, fid, first, last], transaction: t }
        );
      }
    }

    // 24 HS students grades 9–12
    let studentCounter = 0;
    for (const grade of [9,10,11,12]) {
      for (const k of range(6)) {
        const famId = familyIds[k % familyIds.length];
        const enrollNo = `ENR-${grade}-${(k+1).toString().padStart(3,'0')}`;
        await sequelize.query(
          'INSERT INTO students (school_id, family_id, enrollment_no, first_name, last_name, birthdate, level_id, status, created_at, updated_at)\n           VALUES (?, ?, ?, ?, ?, ?, ?, "active", NOW(), NOW())\n           ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), level_id=VALUES(level_id), updated_at=NOW()',
          { replacements: [ma.id, famId, enrollNo, `Student${++studentCounter}`, `Surname${famId}`, '2010-01-01', hs.id], transaction: t }
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


