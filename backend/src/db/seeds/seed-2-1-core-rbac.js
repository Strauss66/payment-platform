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

    for (const [key_name, display_name] of roles) {
      await sequelize.query(
        'INSERT INTO roles (key_name, display_name) VALUES (?, ?)\n         ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)',
        { replacements: [key_name, display_name], transaction: t }
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
    for (const [key_name, description] of perms) {
      await sequelize.query(
        'INSERT INTO permissions (key_name, description) VALUES (?, ?)\n         ON DUPLICATE KEY UPDATE description = VALUES(description)',
        { replacements: [key_name, description], transaction: t }
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
    const [roleRows] = await sequelize.query('SELECT id, key_name FROM roles', { transaction: t });
    const [permRows] = await sequelize.query('SELECT id, key_name FROM permissions', { transaction: t });
    const codeToRoleId = Object.fromEntries(roleRows.map(r => [r.key_name, r.id]));
    const codeToPermId = Object.fromEntries(permRows.map(p => [p.key_name, p.id]));

    for (const [roleCode, permCodes] of Object.entries(rolePermMap)) {
      const roleId = codeToRoleId[roleCode];
      if (!roleId) continue;
      for (const permCode of permCodes) {
        const permId = codeToPermId[permCode];
        if (!permId) continue;
        await sequelize.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)\n           ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id)',
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


