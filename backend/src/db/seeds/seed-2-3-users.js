import bcrypt from 'bcrypt';
import { sequelize } from '../../config/db.js';

export default async function seedUsers() {
  const t = await sequelize.transaction();
  try {
    const [[def]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = "default"', { transaction: t });
    const [[ma]] = await sequelize.query('SELECT id FROM schools WHERE subdomain = "monte"', { transaction: t });

    if (!def || !ma) throw new Error('Schools not seeded yet');

    // Ensure roles exist
    const [roles] = await sequelize.query('SELECT id, code FROM roles', { transaction: t });
    const roleId = Object.fromEntries(roles.map(r => [r.code, r.id]));

    const users = [
      { email: 'root@system.local', password: 'Passw0rd!', first_name: 'Root', last_name: 'User', school_id: def.id, roles: ['super_admin'] },
      { email: 'admin@monte.local', password: 'Passw0rd!', first_name: 'Admin', last_name: 'MA', school_id: ma.id, roles: ['admin'] },
      { email: 'cashier@monte.local', password: 'Passw0rd!', first_name: 'Cashier', last_name: 'MA', school_id: ma.id, roles: ['cashier'] }
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await sequelize.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), updated_at=NOW()',
        { replacements: [u.email, hash, u.first_name, u.last_name], transaction: t }
      );
      const [[usr]] = await sequelize.query('SELECT id FROM users WHERE email = ?', { replacements: [u.email], transaction: t });

      // scope to schools
      await sequelize.query(
        'INSERT INTO user_schools (user_id, school_id, is_primary, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary), updated_at = NOW()',
        { replacements: [usr.id, u.school_id], transaction: t }
      );

      // roles
      for (const r of u.roles) {
        const rid = roleId[r];
        if (!rid) continue;
        await sequelize.query(
          'INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())\n           ON DUPLICATE KEY UPDATE updated_at = NOW()',
          { replacements: [usr.id, rid], transaction: t }
        );
      }
    }

    await t.commit();
    console.log('✅ Seeded users + user_schools + user_roles');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed users failed:', err.message);
    throw err;
  }
}


