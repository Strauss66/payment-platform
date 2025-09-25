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
  default_school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  email: { type: DataTypes.STRING(160), allowNull: false },
  username: { type: DataTypes.STRING(100) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('active','disabled'), defaultValue: 'active' }
}, { tableName: 'users', underscored: true });

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

// User-School relations (many-to-many) + default school
export const UserSchool = sequelize.define('user_schools', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  is_primary: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 }
}, { tableName: 'user_schools', underscored: true });

User.belongsToMany(School, { through: UserSchool, foreignKey: 'user_id', otherKey: 'school_id', as: 'schools' });
School.belongsToMany(User, { through: UserSchool, foreignKey: 'school_id', otherKey: 'user_id', as: 'users' });
User.belongsTo(School, { as: 'defaultSchool', foreignKey: 'default_school_id' });

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
  level_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
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
  is_default: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  // CFDI 4.0
  rfc: { type: DataTypes.STRING(13) },
  regimen_fiscal: { type: DataTypes.STRING(4) },
  csd_cert_b64: { type: DataTypes.TEXT('long') },
  csd_key_enc: { type: DataTypes.TEXT('long') },
  csd_key_iv: { type: DataTypes.BLOB('tiny') },
  csd_pass_enc: { type: DataTypes.TEXT('long') },
  pac_provider: { type: DataTypes.STRING(32) },
  pac_credentials: { type: DataTypes.JSON },
  cert_serial: { type: DataTypes.STRING(40) },
  cert_valid_from: { type: DataTypes.DATE },
  cert_valid_to: { type: DataTypes.DATE }
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

// --- Tax identities (receptors) ---
export const TaxIdentity = sequelize.define('tax_identities', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  family_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  student_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  type: { type: DataTypes.ENUM('family','student'), allowNull: false, defaultValue: 'family' },
  rfc: { type: DataTypes.STRING(13), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  uso_cfdi: { type: DataTypes.STRING(3), allowNull: false },
  regimen_fiscal_receptor: { type: DataTypes.STRING(4), allowNull: true },
  postal_code: { type: DataTypes.STRING(5), allowNull: false }
}, { tableName: 'tax_identities', underscored: true });

TaxIdentity.belongsTo(Student, { foreignKey: 'student_id', as: 'student', constraints: false });

// --- Invoice CFDI status ---
export const InvoiceCfdi = sequelize.define('invoice_cfdi', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  invoice_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('none','draft','stamped','canceled'), allowNull: false, defaultValue: 'none' },
  uuid: { type: DataTypes.STRING(36) },
  stamped_at: { type: DataTypes.DATE },
  canceled_at: { type: DataTypes.DATE },
  serie: { type: DataTypes.STRING(25) },
  folio: { type: DataTypes.STRING(40) },
  xml: { type: DataTypes.TEXT('medium') },
  tfd_xml: { type: DataTypes.TEXT('long') },
  cancel_reason: { type: DataTypes.STRING(2) },
  cancel_replacement_uuid: { type: DataTypes.STRING(36) },
  qrcode_png: { type: DataTypes.BLOB('long') }
}, { tableName: 'invoice_cfdi', underscored: true });

Invoice.hasOne(InvoiceCfdi, { foreignKey: 'invoice_id', as: 'cfdi' });
InvoiceCfdi.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

// --- Announcements and Audit ---
export const Announcement = sequelize.define('announcements', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('payments','events','activities','other'), allowNull: false },
  audience_type: { type: DataTypes.ENUM('school','section','class','student'), allowNull: false },
  sections: { type: DataTypes.JSON },
  class_ids: { type: DataTypes.JSON },
  student_ids: { type: DataTypes.JSON },
  role_keys: { type: DataTypes.JSON },
  image_keys: { type: DataTypes.JSON },
  image_urls: { type: DataTypes.JSON },
  image_alts: { type: DataTypes.JSON },
  starts_at: { type: DataTypes.DATE, allowNull: false },
  ends_at: { type: DataTypes.DATE },
  created_by: { type: DataTypes.BIGINT.UNSIGNED },
  updated_by: { type: DataTypes.BIGINT.UNSIGNED }
}, { tableName: 'announcements', underscored: true });
Announcement.belongsTo(School, { foreignKey: 'school_id', as: 'school' });

export const AuditLog = sequelize.define('audit_logs', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  actor_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  entity: { type: DataTypes.STRING(64), allowNull: false },
  entity_id: { type: DataTypes.BIGINT, allowNull: false },
  action: { type: DataTypes.STRING(32), allowNull: false },
  before_json: { type: DataTypes.JSON },
  after_json: { type: DataTypes.JSON },
  created_at: { type: DataTypes.DATE }
}, { tableName: 'audit_logs', timestamps: false, underscored: true });

// --- Calendars & Events ---
export const Calendar = sequelize.define('calendars', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(120), allowNull: false },
  color: { type: DataTypes.STRING(16) },
  visibility: { type: DataTypes.ENUM('school','private'), defaultValue: 'school' },
  created_by: { type: DataTypes.BIGINT.UNSIGNED },
  updated_by: { type: DataTypes.BIGINT.UNSIGNED }
}, { tableName: 'calendars', underscored: true });

export const Event = sequelize.define('events', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  school_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  calendar_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  starts_at: { type: DataTypes.DATE, allowNull: false },
  ends_at: { type: DataTypes.DATE },
  location: { type: DataTypes.STRING(200) },
  source_type: { type: DataTypes.ENUM('manual','announcement'), defaultValue: 'manual' },
  announcement_id: { type: DataTypes.BIGINT.UNSIGNED },
  all_day: { type: DataTypes.TINYINT, defaultValue: 0 }
}, { tableName: 'events', underscored: true });

Calendar.hasMany(Event, { foreignKey: 'calendar_id', as: 'events' });
Event.belongsTo(Calendar, { foreignKey: 'calendar_id', as: 'calendar' });