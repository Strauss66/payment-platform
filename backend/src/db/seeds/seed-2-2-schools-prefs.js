import { sequelize } from '../../config/db.js';

export default async function seedSchoolsAndPrefs() {
  const t = await sequelize.transaction();
  try {
    // Single school only: Weglon Test School
    await sequelize.query(
      'INSERT INTO schools (name, slug, subdomain, timezone, is_active, created_at, updated_at) VALUES ("Weglon Test School", "weglon-test-school", "weglon", "America/Mexico_City", 1, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE name = VALUES(name), timezone = VALUES(timezone), is_active = VALUES(is_active), updated_at = NOW()',
      { transaction: t }
    );
    const [[row]] = await sequelize.query('SELECT id FROM schools WHERE slug = "weglon-test-school"', { transaction: t });

    const id = row.id;
    await sequelize.query(
      'INSERT INTO org_prefs (school_id, timezone, privacy_verified, created_at, updated_at) VALUES (?, "America/Mexico_City", 0, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE updated_at = NOW()',
      { replacements: [id], transaction: t }
    );
    await sequelize.query(
      'INSERT INTO global_prefs (school_id, grades_layout, debtor_portal, created_at, updated_at) VALUES (?, "vertical", "view_only", NOW(), NOW())\n       ON DUPLICATE KEY UPDATE updated_at = NOW()',
      { replacements: [id], transaction: t }
    );
    await sequelize.query(
      'INSERT INTO billing_prefs (school_id, created_at, updated_at) VALUES (?, NOW(), NOW())\n       ON DUPLICATE KEY UPDATE updated_at = NOW()',
      { replacements: [id], transaction: t }
    );

    // Remove any extra demo schools to enforce single-school tenancy
    await sequelize.query('DELETE FROM schools WHERE slug IS NOT NULL AND slug <> "weglon-test-school"', { transaction: t });

    await t.commit();
    console.log('✅ Seeded single school + prefs (Weglon Test School)');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed schools/prefs failed:', err.message);
    throw err;
  }
}

export async function up() { return seedSchoolsAndPrefs(); }
export async function down() { /* no-op */ }


