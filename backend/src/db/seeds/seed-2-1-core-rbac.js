import { sequelize } from '../../config/db.js';

export default async function seedCoreRbac() {
  const t = await sequelize.transaction();
  try {
    // roles
    const roles = [
      ['super_admin', 'Super Admin'],
      ['admin', 'Administrator'],
      ['cashier', 'Cashier'],
      ['registrar', 'Registrar'],
      ['teacher', 'Teacher'],
      ['coordinator', 'Coordinator'],
      ['student_parent', 'Student/Parent']
    ];

    for (const [code, name] of roles) {
      await sequelize.query(
        'INSERT INTO roles (code, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW()',
        { replacements: [code, name], transaction: t }
      );
    }

    // minimal permissions
    const perms = [
      ['invoice.read', 'Read invoices'],
      ['invoice.create', 'Create invoices'],
      ['payment.create', 'Record payments'],
      ['payment.refund', 'Issue refunds'],
      ['user.manage', 'Manage users'],
      ['prefs.manage', 'Manage preferences']
    ];
    for (const [code, name] of perms) {
      await sequelize.query(
        'INSERT INTO permissions (code, name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())\n         ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW()',
        { replacements: [code, name], transaction: t }
      );
    }

    // role_permissions minimal sets
    const rolePermMap = {
      super_admin: perms.map(p => p[0]),
      admin: ['invoice.read', 'invoice.create', 'payment.create', 'user.manage', 'prefs.manage'],
      cashier: ['invoice.read', 'payment.create'],
      registrar: [],
      teacher: [],
      coordinator: [],
      student_parent: ['invoice.read']
    };

    // Fetch role ids and permission ids
    const [roleRows] = await sequelize.query('SELECT id, code FROM roles', { transaction: t });
    const [permRows] = await sequelize.query('SELECT id, code FROM permissions', { transaction: t });
    const codeToRoleId = Object.fromEntries(roleRows.map(r => [r.code, r.id]));
    const codeToPermId = Object.fromEntries(permRows.map(p => [p.code, p.id]));

    for (const [roleCode, permCodes] of Object.entries(rolePermMap)) {
      const roleId = codeToRoleId[roleCode];
      if (!roleId) continue;
      for (const permCode of permCodes) {
        const permId = codeToPermId[permCode];
        if (!permId) continue;
        await sequelize.query(
          'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())\n           ON DUPLICATE KEY UPDATE updated_at = NOW()',
          { replacements: [roleId, permId], transaction: t }
        );
      }
    }

    await t.commit();
    console.log('✅ Seeded core RBAC');
  } catch (err) {
    await t.rollback();
    console.error('❌ seed core RBAC failed:', err.message);
    throw err;
  }
}

// For sequelize-cli compatibility
export async function up() { return seedCoreRbac(); }
export async function down() { /* no-op rollback */ }


