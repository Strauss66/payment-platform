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
  timezone: { type: DataTypes.STRING(64), defaultValue: 'America/Denver' }
}, { tableName: 'schools' });

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