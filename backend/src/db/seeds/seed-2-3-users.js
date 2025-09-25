import bcrypt from 'bcrypt';
import { sequelize } from '../../config/db.js';

export default async function seedUsers() {
  const t = await sequelize.transaction();
  try {
    const [[school]] = await sequelize.query('SELECT id FROM schools WHERE slug = "weglon-test-school"', { transaction: t });
    if (!school) throw new Error('School not seeded yet');

    // Ensure roles exist
    const [roles] = await sequelize.query('SELECT id, key_name FROM roles', { transaction: t });
    const roleId = Object.fromEntries(roles.map(r => [r.key_name, r.id]));

    const users = [
      { email: 'superadmin@weglon.test', password: 'Superadmin123!', first_name: 'Super', last_name: 'Admin', roles: ['super_admin'] },
      { email: 'admin@weglon.test', password: 'Admin123!', first_name: 'Admin', last_name: 'Weglon', roles: ['admin'] },
      { email: 'cashier@weglon.test', password: 'Cashier123!', first_name: 'Cashier', last_name: 'Weglon', roles: ['cashier'] },
      { email: 'teacher@weglon.test', password: 'Teacher123!', first_name: 'Teacher', last_name: 'Weglon', roles: ['teacher'] },
      { email: 'student@weglon.test', password: 'Student123!', first_name: 'Student', last_name: 'Weglon', roles: ['student_parent'] },
      { email: 'parent@weglon.test', password: 'Parent123!', first_name: 'Parent', last_name: 'Weglon', roles: ['student_parent'] }
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await sequelize.query(
        'INSERT INTO users (email, password_hash, username, school_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, "active", NOW(), NOW())\n         ON DUPLICATE KEY UPDATE username=VALUES(username), school_id=VALUES(school_id), status=VALUES(status), updated_at=NOW()',
        { replacements: [u.email, hash, u.email.split('@')[0], school.id], transaction: t }
      );
      const [[usr]] = await sequelize.query('SELECT id FROM users WHERE email = ?', { replacements: [u.email], transaction: t });

      // scope to schools
      await sequelize.query(
        'INSERT INTO user_schools (user_id, school_id, is_primary, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary), updated_at = NOW()',
        { replacements: [usr.id, school.id], transaction: t }
      );
      // set default_school_id
      await sequelize.query('UPDATE users SET default_school_id = COALESCE(default_school_id, ?) WHERE id = ?', { replacements: [school.id, usr.id], transaction: t });

      // roles
      for (const r of u.roles) {
        const rid = roleId[r];
        if (!rid) continue;
        await sequelize.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)\n           ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)',
          { replacements: [usr.id, rid], transaction: t }
        );
      }
    }

    await t.commit();
    console.log('✅ Seeded users to Weglon Test School + user_schools + user_roles');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed users failed:', err.message);
    throw err;
  }
}

export async function up() { return seedUsers(); }
export async function down() { /* no-op */ }


