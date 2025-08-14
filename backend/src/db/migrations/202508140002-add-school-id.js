// Add school_id to users, students, invoices with backfill and indexes
import { sequelize } from '../../config/db.js';

async function columnExists(table, column) {
  const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE :col`, { replacements: { col: column } });
  return cols.length > 0;
}

async function addColumnIfMissing(qi, table, column, spec) {
  if (!(await columnExists(table, column))) {
    await qi.addColumn(table, column, spec);
  }
}

async function addFkIfMissing(qi, table, column, fkName) {
  try {
    await qi.addConstraint(table, {
      fields: [column],
      type: 'foreign key',
      name: fkName,
      references: { table: 'schools', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  } catch (e) { /* ignore if exists */ }
}

async function notNull(qi, table, column) {
  try {
    await qi.changeColumn(table, column, { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: false });
  } catch (e) { /* ignore */ }
}

async function addIndex(qi, table, fields, options) {
  try { await qi.addIndex(table, { fields, ...options }); } catch (e) { /* ignore */ }
}

export async function up() {
  const qi = sequelize.getQueryInterface();

  // Ensure a default school exists for fallback
  const [[def]] = await sequelize.query("SELECT id FROM schools WHERE slug='default' ORDER BY id LIMIT 1");
  const [[any]] = def ? [ [def] ] : await sequelize.query('SELECT id FROM schools ORDER BY id LIMIT 1');
  const defaultSchoolId = any?.id || null;

  // Users
  await addColumnIfMissing(qi, 'users', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true });
  await addFkIfMissing(qi, 'users', 'school_id', 'fk_users_school_id');
  if (defaultSchoolId) {
    await sequelize.query('UPDATE users SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
  }
  await notNull(qi, 'users', 'school_id');
  await addIndex(qi, 'users', ['school_id']);

  // Students
  await addColumnIfMissing(qi, 'students', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true });
  await addFkIfMissing(qi, 'students', 'school_id', 'fk_students_school_id');
  // Backfill from users if present
  await sequelize.query('UPDATE students s JOIN users u ON u.id = s.user_id SET s.school_id = COALESCE(s.school_id, u.school_id)');
  if (defaultSchoolId) {
    await sequelize.query('UPDATE students SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
  }
  await notNull(qi, 'students', 'school_id');
  await addIndex(qi, 'students', ['school_id']);
  await addIndex(qi, 'students', ['school_id', 'last_name'], { name: 'idx_students_school_lastname' });

  // Invoices (only if table exists)
  const [invTables] = await sequelize.query("SHOW TABLES LIKE 'invoices'");
  if (invTables.length) {
    await addColumnIfMissing(qi, 'invoices', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true });
    await addFkIfMissing(qi, 'invoices', 'school_id', 'fk_invoices_school_id');
    // Backfill from students via student_id if exists
    const [colStudent] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'student_id'");
    if (colStudent.length) {
      await sequelize.query('UPDATE invoices i JOIN students s ON s.id = i.student_id SET i.school_id = COALESCE(i.school_id, s.school_id)');
    }
    if (defaultSchoolId) {
      await sequelize.query('UPDATE invoices SET school_id = COALESCE(school_id, :sid)', { replacements: { sid: defaultSchoolId } });
    }
    await notNull(qi, 'invoices', 'school_id');
    await addIndex(qi, 'invoices', ['school_id']);
    // Add composite index if columns exist
    const [colStatus] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'status'");
    const [colDue] = await sequelize.query("SHOW COLUMNS FROM `invoices` LIKE 'due_at'");
    if (colStatus.length && colDue.length) {
      await addIndex(qi, 'invoices', ['school_id', 'status', 'due_at'], { name: 'idx_invoices_school_status_due' });
    }
  }

  // Users composite role index approximation:
  // Since role is stored in user_roles, add helpful indexes there
  const [urTables] = await sequelize.query("SHOW TABLES LIKE 'user_roles'");
  if (urTables.length) {
    await addIndex(qi, 'user_roles', ['role_id', 'user_id'], { name: 'idx_user_roles_role_user' });
  }
}

export async function down() {
  const qi = sequelize.getQueryInterface();
  async function dropIndex(table, name) { try { await qi.removeIndex(table, name); } catch (e) { /* ignore */ } }

  // Drop composite indexes
  await dropIndex('students', 'idx_students_school_lastname');
  await dropIndex('invoices', 'idx_invoices_school_status_due');
  await dropIndex('user_roles', 'idx_user_roles_role_user');

  // Relax NOT NULL back to NULL on school_id columns (keep columns and FKs for safety)
  try { await qi.changeColumn('users', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
  try { await qi.changeColumn('students', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
  const [invTables] = await sequelize.query("SHOW TABLES LIKE 'invoices'");
  if (invTables.length) {
    try { await qi.changeColumn('invoices', 'school_id', { type: sequelize.Sequelize.BIGINT.UNSIGNED, allowNull: true }); } catch (e) {}
  }
}


