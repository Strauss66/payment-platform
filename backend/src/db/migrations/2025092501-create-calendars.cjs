"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;

    await qi.createTable(
      "calendars",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        color: { type: Sequelize.STRING(16), allowNull: true },
        visibility: { type: Sequelize.ENUM('school','private'), allowNull: false, defaultValue: 'school' },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
      },
      { underscored: true }
    );

    await qi.addConstraint('calendars', {
      fields: ['school_id'], type: 'foreign key', name: 'fk_calendars_school',
      references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE'
    });

    await qi.addIndex('calendars', ['school_id','visibility','name'], { name: 'idx_calendars_school_visibility_name' });
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try { await qi.removeConstraint('calendars', 'fk_calendars_school'); } catch {}
    try { await qi.removeIndex('calendars', 'idx_calendars_school_visibility_name'); } catch {}
    try { await qi.dropTable('calendars'); } catch {}
  }
};


