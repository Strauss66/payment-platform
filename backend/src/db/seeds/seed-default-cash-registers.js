import { sequelize } from '../../config/db.js';

export default async function seedDefaultCashRegisters() {
  const t = await sequelize.transaction();
  try {
    const [schools] = await sequelize.query('SELECT id FROM schools', { transaction: t });

    for (const s of schools) {
      await sequelize.query(
        'INSERT INTO cash_registers (school_id, name, location, is_active, created_at, updated_at)\n' +
          'VALUES (?, "Front Desk", NULL, 1, NOW(), NOW())\n' +
          'ON DUPLICATE KEY UPDATE is_active=VALUES(is_active), updated_at=NOW()',
        { replacements: [s.id], transaction: t }
      );
    }

    await t.commit();
    console.log('✅ Seeded default cash registers (Front Desk)');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed-default-cash-registers failed:', err.message);
    throw err;
  }
}

export async function up() { return seedDefaultCashRegisters(); }
export async function down() {
  // Remove the default register entries named 'Front Desk' for rollback
  await sequelize.query('DELETE FROM cash_registers WHERE name = "Front Desk"');
}


