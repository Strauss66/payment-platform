module.exports = {
  up: async (queryInterface, Sequelize) => {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    async function columnExists(table, column) {
      const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE :col`, { replacements: { col: column } });
      return cols.length > 0;
    }

    async function addColumnIfMissing(table, column, spec) {
      if (!(await columnExists(table, column))) {
        await qi.addColumn(table, column, spec);
      }
    }

    async function addFkIfMissing(table, column, fkName) {
      try {
        await qi.addConstraint(table, {
          fields: [column],
          type: 'foreign key',
          name: fkName,
          references: { table: 'schools', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        });
      } catch (e) {}
    }

    async function notNull(table, column) {
      try {
        await qi.changeColumn(table, column, { type: Sequelize.BIGINT.UNSIGNED, allowNull: false });
      } catch (e) {}
    }

    async function addIndex(table, fields, options) {
      try { await qi.addIndex(table, { fields, ...options }); } catch (e) {}
    }

    const [[def]] = await sequelize.query("SELECT id FROM schools WHERE slug='default' ORDER BY id LIMIT 1");
    const [[any]] = def ? [ [def] ] : await sequelize.query('SELECT id FROM schools ORDER BY id LIMIT 1');
    const defaultSchoolId = any?.id || null;

    await addColumnIfMissing('users', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true });
    await addFkIfMissing('users', 'school_id', 'fk_users_school_id');
    if (defaultSchoolId) {
      await sequelize.query('UPDATE users SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
    }
    await notNull('users', 'school_id');
    await addIndex('users', ['school_id']);

    await addColumnIfMissing('students', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true });
    await addFkIfMissing('students', 'school_id', 'fk_students_school_id');
    await sequelize.query('UPDATE students s JOIN users u ON u.id = s.user_id SET s.school_id = COALESCE(s.school_id, u.school_id)');
    if (defaultSchoolId) {
      await sequelize.query('UPDATE students SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
    }
    await notNull('students', 'school_id');
    await addIndex('students', ['school_id']);
    await addIndex('students', ['school_id', 'last_name'], { name: 'idx_students_school_lastname' });

    const [invTables] = await sequelize.query("SHOW TABLES LIKE 'invoices'");
    if (invTables.length) {
      await addColumnIfMissing('invoices', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true });
      await addFkIfMissing('invoices', 'school_id', 'fk_invoices_school_id');
      const [colStudent] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'student_id'");
      if (colStudent.length) {
        await sequelize.query('UPDATE invoices i JOIN students s ON s.id = i.student_id SET i.school_id = COALESCE(i.school_id, s.school_id)');
      }
      if (defaultSchoolId) {
        await sequelize.query('UPDATE invoices SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
      }
      await notNull('invoices', 'school_id');
      await addIndex('invoices', ['school_id']);
      const [colStatus] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'status'");
      const [colDue] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'due_at'");
      if (colStatus.length && colDue.length) {
        await addIndex('invoices', ['school_id', 'status', 'due_at'], { name: 'idx_invoices_school_status_due' });
      }
    }

    const [urTables] = await sequelize.query("SHOW TABLES LIKE 'user_roles'");
    if (urTables.length) {
      await addIndex('user_roles', ['role_id', 'user_id'], { name: 'idx_user_roles_role_user' });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const qi = queryInterface;
    async function dropIndex(table, name) { try { await qi.removeIndex(table, name); } catch (e) {} }
    await dropIndex('students', 'idx_students_school_lastname');
    await dropIndex('invoices', 'idx_invoices_school_status_due');
    await dropIndex('user_roles', 'idx_user_roles_role_user');
    try { await qi.changeColumn('users', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
    try { await qi.changeColumn('students', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
    const sequelize = qi.sequelize;
    const [invTables] = await sequelize.query("SHOW TABLES LIKE 'invoices'");
    if (invTables.length) {
      try { await qi.changeColumn('invoices', 'school_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
    }
  }
};


