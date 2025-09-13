'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_plans', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      name: { type: Sequelize.STRING(160), allowNull: false },
      level_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      description: { type: Sequelize.STRING(512), allowNull: true },
      cadence: { type: Sequelize.ENUM('monthly','once','custom'), allowNull: false, defaultValue: 'monthly' },
      amount_cents: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      currency: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'MXN' },
      start_month: { type: Sequelize.STRING(7), allowNull: false },
      end_month: { type: Sequelize.STRING(7), allowNull: true },
      proration: { type: Sequelize.ENUM('none','pro-rata-days','first-period-full'), allowNull: false, defaultValue: 'none' },
      is_active: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('payment_plans', ['school_id','is_active'], { name: 'idx_payment_plans_school_active' });
    await queryInterface.addIndex('payment_plans', ['school_id','level_id'], { name: 'idx_payment_plans_school_level' });
    await queryInterface.addConstraint('payment_plans', { fields: ['school_id'], type: 'foreign key', name: 'fk_payment_plans_school', references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

    await queryInterface.createTable('payment_plan_items', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      plan_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      concept_code: { type: Sequelize.STRING(64), allowNull: false },
      amount_cents: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      sort: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }
    });
    await queryInterface.addIndex('payment_plan_items', ['plan_id'], { name: 'idx_payment_plan_items_plan' });
    await queryInterface.addConstraint('payment_plan_items', { fields: ['plan_id'], type: 'foreign key', name: 'fk_payment_plan_items_plan', references: { table: 'payment_plans', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' });
    await queryInterface.addConstraint('payment_plan_items', { fields: ['school_id'], type: 'foreign key', name: 'fk_payment_plan_items_school', references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

    await queryInterface.createTable('student_plan_assignments', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      plan_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      assigned_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      effective_month: { type: Sequelize.STRING(7), allowNull: false },
      override_amount_cents: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      status: { type: Sequelize.ENUM('active','paused','ended'), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('student_plan_assignments', ['school_id','student_id','plan_id','effective_month'], { name: 'ux_student_plan_assignments', unique: true });
    await queryInterface.addConstraint('student_plan_assignments', { fields: ['school_id'], type: 'foreign key', name: 'fk_spa_school', references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    await queryInterface.addConstraint('student_plan_assignments', { fields: ['student_id'], type: 'foreign key', name: 'fk_spa_student', references: { table: 'students', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
    await queryInterface.addConstraint('student_plan_assignments', { fields: ['plan_id'], type: 'foreign key', name: 'fk_spa_plan', references: { table: 'payment_plans', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });

    await queryInterface.createTable('invoice_generation_runs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      run_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      from_month: { type: Sequelize.STRING(7), allowNull: false },
      to_month: { type: Sequelize.STRING(7), allowNull: false },
      created_invoices: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      skipped: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.JSON, allowNull: true }
    });
    await queryInterface.addIndex('invoice_generation_runs', ['school_id','run_at'], { name: 'idx_invoice_generation_runs_school_run' });
    await queryInterface.addConstraint('invoice_generation_runs', { fields: ['school_id'], type: 'foreign key', name: 'fk_invoice_generation_runs_school', references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invoice_generation_runs');
    await queryInterface.dropTable('student_plan_assignments');
    await queryInterface.dropTable('payment_plan_items');
    await queryInterface.dropTable('payment_plans');
  }
};


