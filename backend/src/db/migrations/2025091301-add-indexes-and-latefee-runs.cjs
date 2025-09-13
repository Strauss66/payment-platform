'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Indexes
    await queryInterface.addIndex('invoices', ['school_id', 'status', 'due_date'], { name: 'idx_invoices_school_status_due' });
    await queryInterface.addIndex('payments', ['school_id', 'paid_at', 'payment_method_id'], { name: 'idx_payments_school_paid_method' });
    await queryInterface.addIndex('cash_sessions', ['school_id', 'opened_at'], { name: 'idx_cash_sessions_school_opened' });

    // Late fee runs ledger
    await queryInterface.createTable('late_fee_runs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      year_month: { type: Sequelize.STRING(7), allowNull: false }, // YYYY-MM
      ran_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      invoices_evaluated: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      invoices_with_fee: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_fee_preview: { type: Sequelize.DECIMAL(12,2), allowNull: false, defaultValue: 0 }
    });
    await queryInterface.addIndex('late_fee_runs', ['school_id', 'year_month'], { name: 'ux_late_fee_runs_school_month', unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('cash_sessions', 'idx_cash_sessions_school_opened');
    await queryInterface.removeIndex('payments', 'idx_payments_school_paid_method');
    await queryInterface.removeIndex('invoices', 'idx_invoices_school_status_due');
    await queryInterface.dropTable('late_fee_runs');
  }
};


