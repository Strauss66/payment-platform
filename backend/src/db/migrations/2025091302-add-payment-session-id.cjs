'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'session_id', { type: Sequelize.BIGINT.UNSIGNED, allowNull: true, after: 'cashier_user_id' });
    await queryInterface.addIndex('payments', ['session_id'], { name: 'idx_payments_session' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('payments', 'idx_payments_session');
    await queryInterface.removeColumn('payments', 'session_id');
  }
};


