module.exports = {
  up: async (queryInterface, Sequelize) => {
    const qi = queryInterface;

    // schools
    await qi.createTable('schools', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(160), allowNull: false },
      slug: { type: Sequelize.STRING(80), allowNull: true },
      subdomain: { type: Sequelize.STRING(80), allowNull: true },
      primary_color: { type: Sequelize.STRING(16), allowNull: true },
      secondary_color: { type: Sequelize.STRING(16), allowNull: true },
      logo_url: { type: Sequelize.STRING(512), allowNull: true },
      s3_bucket: { type: Sequelize.STRING(128), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      timezone: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'America/Denver' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // roles
    await qi.createTable('roles', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      key_name: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      display_name: { type: Sequelize.STRING(128), allowNull: false }
    });

    // permissions
    await qi.createTable('permissions', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      key_name: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(255), allowNull: true }
    });

    // role_permissions (junction)
    await qi.createTable('role_permissions', {
      role_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      permission_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    await qi.addIndex('role_permissions', ['role_id', 'permission_id'], { unique: true, name: 'uniq_role_permissions' });
    await qi.addConstraint('role_permissions', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_role_permissions_role',
      references: { table: 'roles', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('role_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'fk_role_permissions_permission',
      references: { table: 'permissions', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // users
    await qi.createTable('users', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING(160), allowNull: false },
      username: { type: Sequelize.STRING(100), allowNull: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      status: { type: Sequelize.ENUM('active','disabled'), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await qi.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });

    // user_roles (junction)
    await qi.createTable('user_roles', {
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      role_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    await qi.addIndex('user_roles', ['user_id', 'role_id'], { unique: true, name: 'uniq_user_roles' });
    await qi.addConstraint('user_roles', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_roles_user',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('user_roles', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'fk_user_roles_role',
      references: { table: 'roles', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // students
    await qi.createTable('students', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      first_name: { type: Sequelize.STRING(255), allowNull: false },
      last_name: { type: Sequelize.STRING(255), allowNull: false },
      age: { type: Sequelize.INTEGER, allowNull: true },
      address: { type: Sequelize.STRING(255), allowNull: true },
      parent_guardian_name: { type: Sequelize.STRING(255), allowNull: true },
      grade: { type: Sequelize.STRING(50), allowNull: true },
      balance: { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
      late_fees: { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 }
    });
    await qi.addConstraint('students', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_students_user',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await qi.addIndex('students', ['last_name'], { name: 'idx_students_lastname' });

    // classes
    await qi.createTable('classes', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      teacher_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true }
    });

    // enrollments
    await qi.createTable('enrollments', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      class_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    await qi.addConstraint('enrollments', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_enrollments_student',
      references: { table: 'students', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('enrollments', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'fk_enrollments_class',
      references: { table: 'classes', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // dashboard_layouts
    await qi.createTable('dashboard_layouts', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      view: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'portal' },
      layout_json: { type: Sequelize.TEXT('long'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await qi.addConstraint('dashboard_layouts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_dashboard_layouts_user',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addConstraint('dashboard_layouts', {
      fields: ['school_id'],
      type: 'foreign key',
      name: 'fk_dashboard_layouts_school',
      references: { table: 'schools', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await qi.addIndex('dashboard_layouts', ['user_id', 'school_id', 'view'], { unique: true, name: 'uniq_dashboard_layouts_user_school_view' });
  },

  down: async (queryInterface) => {
    const qi = queryInterface;
    await qi.dropTable('dashboard_layouts');
    await qi.dropTable('enrollments');
    await qi.dropTable('classes');
    await qi.dropTable('students');
    await qi.dropTable('user_roles');
    await qi.dropTable('users');
    await qi.dropTable('role_permissions');
    await qi.dropTable('permissions');
    await qi.dropTable('roles');
    await qi.dropTable('schools');
  }
};


