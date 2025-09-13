// backend/src/models/index.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Role = sequelize.define('roles', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  key_name: { type: DataTypes.STRING(64), unique: true, allowNull: false },
  display_name: { type: DataTypes.STRING(128), allowNull: false }
}, { tableName: 'roles', timestamps: false });

export const Permission = sequelize.define('permissions', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  key_name: { type: DataTypes.STRING(128), unique: true, allowNull: false },
  description: { type: DataTypes.STRING(255) }
}, { tableName: 'permissions', timestamps: false });

export const School = sequelize.define('schools', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  slug: { type: DataTypes.STRING(80), allowNull: true, unique: true },
  subdomain: { type: DataTypes.STRING(80), allowNull: true, unique: true },
  primary_color: { type: DataTypes.STRING(16), allowNull: true },
  secondary_color: { type: DataTypes.STRING(16), allowNull: true },
  logo_url: { type: DataTypes.STRING(512), allowNull: true },
  s3_bucket: { type: DataTypes.STRING(128), allowNull: true, unique: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  timezone: { type: DataTypes.STRING(64), defaultValue: 'America/Denver' }
}, { tableName: 'schools', timestamps: true, underscored: true });

export const User = sequelize.define('users', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false },
  username: { type: DataTypes.STRING(100) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('active','disabled'), defaultValue: 'active' }
}, { tableName: 'users' });

export const UserRole = sequelize.define('user_roles', {
  user_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
  role_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true }
}, { tableName: 'user_roles', timestamps: false });

export const RolePermission = sequelize.define('role_permissions', {
  role_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
  permission_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true }
}, { tableName: 'role_permissions', timestamps: false });

// Simple association for the admin seeder
UserRole.removeAttribute('id'); // ensure composite PK only

// Associations
// Link user_roles to users and roles for includes to work
UserRole.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// Convenience many-to-many (not heavily used yet, but helpful)
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// Dashboard layout persistence per user and school
export const DashboardLayout = sequelize.define('dashboard_layouts', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  view: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'portal' },
  layout_json: { type: DataTypes.TEXT('long'), allowNull: false }
}, {
  tableName: 'dashboard_layouts',
  indexes: [
    { unique: true, fields: ['user_id', 'school_id', 'view'] }
  ]
});

// --- Academic domain models ---
export const Student = sequelize.define('students', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  // allowNull true to avoid migration failure on existing rows; association still links to users
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  first_name: { type: DataTypes.STRING(255), allowNull: false },
  last_name: { type: DataTypes.STRING(255), allowNull: false },
  age: { type: DataTypes.INTEGER },
  address: { type: DataTypes.STRING(255) },
  parent_guardian_name: { type: DataTypes.STRING(255) },
  grade: { type: DataTypes.STRING(50) },
  balance: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  late_fees: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
}, { tableName: 'students', timestamps: false });

export const Class = sequelize.define('classes', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  teacher_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }
}, { tableName: 'classes', timestamps: false });

export const Enrollment = sequelize.define('enrollments', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  class_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, { tableName: 'enrollments', timestamps: false });

// Associations for academic domain
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user', constraints: false });
User.hasOne(Student, { foreignKey: 'user_id', as: 'student', constraints: false });

Student.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Class.hasMany(Enrollment, { foreignKey: 'class_id', as: 'enrollments' });
Enrollment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// --- Billing domain models ---
export const InvoicingEntity = sequelize.define('invoicing_entities', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(160), allowNull: false },
  tax_id: { type: DataTypes.STRING(32) },
  tax_system_code: { type: DataTypes.STRING(16) },
  email: { type: DataTypes.STRING(191) },
  phone: { type: DataTypes.STRING(32) },
  address_json: { type: DataTypes.JSON },
  is_default: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 }
}, { tableName: 'invoicing_entities', underscored: true });

export const CashRegister = sequelize.define('cash_registers', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(120), allowNull: false },
  location: { type: DataTypes.STRING(120) },
  is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 }
}, { tableName: 'cash_registers', underscored: true });

export const CashSession = sequelize.define('cash_sessions', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  cash_register_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  opened_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  opened_at: { type: DataTypes.DATE, allowNull: false },
  closed_at: { type: DataTypes.DATE },
  totals_json: { type: DataTypes.JSON }
}, { tableName: 'cash_sessions', underscored: true });

CashRegister.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
CashSession.belongsTo(CashRegister, { foreignKey: 'cash_register_id', as: 'register' });
CashSession.belongsTo(User, { foreignKey: 'opened_by', as: 'openedBy' });

// --- AR/AP models used by services ---
export const Invoice = sequelize.define('invoices', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  student_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  charge_concept_id: { type: DataTypes.BIGINT.UNSIGNED },
  period_month: { type: DataTypes.TINYINT },
  period_year: { type: DataTypes.SMALLINT },
  due_date: { type: DataTypes.DATEONLY },
  subtotal: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  discount_total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  tax_total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  late_fee_accrued: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  paid_total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  balance: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('open','partial','paid','void'), defaultValue: 'open' }
}, { tableName: 'invoices', underscored: true });

export const InvoiceItem = sequelize.define('invoice_items', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  qty: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  tax_amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  line_total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 }
}, { tableName: 'invoice_items', timestamps: false, underscored: true });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

export const Payment = sequelize.define('payments', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  invoice_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  payment_method_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  paid_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ref: { type: DataTypes.STRING(64) },
  cashier_user_id: { type: DataTypes.BIGINT.UNSIGNED },
  session_id: { type: DataTypes.BIGINT.UNSIGNED },
  note: { type: DataTypes.STRING(255) }
}, { tableName: 'payments', underscored: true });

export const PaymentAllocation = sequelize.define('payment_allocations', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  payment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  invoice_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  invoice_item_id: { type: DataTypes.BIGINT.UNSIGNED },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, { tableName: 'payment_allocations', timestamps: false, underscored: true });

Payment.hasMany(PaymentAllocation, { foreignKey: 'payment_id', as: 'allocations' });
PaymentAllocation.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
PaymentAllocation.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

Payment.belongsTo(CashSession, { foreignKey: 'session_id', as: 'session' });

// Link invoices to students for search/join needs
Invoice.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });