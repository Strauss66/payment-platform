import { sequelize } from '../../config/db.js';

export default async function seedBasics() {
  const t = await sequelize.transaction();
  try {
    const [[ma]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = "monte"', { transaction: t });
    if (!ma) throw new Error('Monte Albán not found');

    // Levels (HS, MS)
    const levels = [
      ['HS', 'High School', 1],
      ['MS', 'Middle School', 2]
    ];
    for (const [code, name, order] of levels) {
      await sequelize.query(
        'INSERT INTO levels (school_id, code, name, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE name=VALUES(name), display_order=VALUES(display_order), updated_at=NOW()',
        { replacements: [ma.id, code, name, order], transaction: t }
      );
    }

    // School Year (Aug 2025 – Jun 2026) default
    await sequelize.query(
      'INSERT INTO school_years (school_id, name, start_date, end_date, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE start_date=VALUES(start_date), end_date=VALUES(end_date), is_default=VALUES(is_default), updated_at=NOW()',
      { replacements: [ma.id, '2025-2026', '2025-08-01', '2026-06-30'], transaction: t }
    );
    const [[sy]] = await sequelize.query('SELECT id FROM school_years WHERE school_id=? AND name=?', { replacements: [ma.id, '2025-2026'], transaction: t });

    // Holidays (sample Mexico federal)
    const holidays = [
      ['Independence Day', '2025-09-16', '2025-09-16'],
      ['Revolution Day', '2025-11-20', '2025-11-20'],
      ['Constitution Day', '2026-02-05', '2026-02-05']
    ];
    for (const [name, start, end] of holidays) {
      await sequelize.query(
        'INSERT INTO holidays (school_id, name, start_date, end_date, created_at, updated_at)\n         SELECT ?, ?, ?, ?, NOW(), NOW()\n         WHERE NOT EXISTS (SELECT 1 FROM holidays WHERE school_id=? AND name=? AND start_date=? AND end_date=?)',
        { replacements: [ma.id, name, start, end, ma.id, name, start, end], transaction: t }
      );
    }

    // Enrollment Series (MA-)
    await sequelize.query(
      'INSERT INTO enrollment_series (school_id, prefix, next_number, padding, per_level, created_at, updated_at) VALUES (?, "MA-", 1, 5, 0, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE updated_at=NOW()',
      { replacements: [ma.id], transaction: t }
    );

    await t.commit();
    console.log('✅ Seeded basics for Monte Albán');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed basics failed:', err.message);
    throw err;
  }
}


