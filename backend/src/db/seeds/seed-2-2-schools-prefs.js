import { sequelize } from '../../config/db.js';

export default async function seedSchoolsAndPrefs() {
  const t = await sequelize.transaction();
  try {
    const schools = [
      { name: 'Default School', subdomain: 'default' },
      { name: 'Monte Albán', subdomain: 'monte' }
    ];

    const schoolIdBySub = {};
    for (const s of schools) {
      await sequelize.query(
        'INSERT INTO schools (name, subdomain, timezone, is_active, created_at, updated_at) VALUES (?, ?, "America/Mexico_City", 1, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE name = VALUES(name), timezone = VALUES(timezone), is_active = VALUES(is_active), updated_at = NOW()',
        { replacements: [s.name, s.subdomain], transaction: t }
      );
      const [[row]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = ?', { replacements: [s.subdomain], transaction: t });
      schoolIdBySub[s.subdomain] = row.id;
    }

    // org_prefs and global_prefs for each
    for (const [sub, id] of Object.entries(schoolIdBySub)) {
      await sequelize.query(
        'INSERT INTO org_prefs (school_id, timezone, privacy_verified, created_at, updated_at) VALUES (?, "America/Mexico_City", 0, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE updated_at = NOW()',
        { replacements: [id], transaction: t }
      );
      await sequelize.query(
        'INSERT INTO global_prefs (school_id, grades_layout, debtor_portal, created_at, updated_at) VALUES (?, "vertical", "view_only", NOW(), NOW())\n         ON DUPLICATE KEY UPDATE updated_at = NOW()',
        { replacements: [id], transaction: t }
      );
      await sequelize.query(
        'INSERT INTO billing_prefs (school_id, created_at, updated_at) VALUES (?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE updated_at = NOW()',
        { replacements: [id], transaction: t }
      );
    }

    await t.commit();
    console.log('✅ Seeded schools + prefs');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed schools/prefs failed:', err.message);
    throw err;
  }
}


