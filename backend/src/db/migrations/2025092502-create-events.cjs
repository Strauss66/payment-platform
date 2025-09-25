"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;

    await qi.createTable(
      "events",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        calendar_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        title: { type: Sequelize.STRING(200), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        starts_at: { type: Sequelize.DATE, allowNull: false },
        ends_at: { type: Sequelize.DATE, allowNull: true },
        location: { type: Sequelize.STRING(200), allowNull: true },
        source_type: { type: Sequelize.ENUM('manual','announcement'), allowNull: false, defaultValue: 'manual' },
        announcement_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true, unique: true },
        all_day: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
      },
      { underscored: true }
    );

    await qi.addConstraint('events', {
      fields: ['school_id'], type: 'foreign key', name: 'fk_events_school',
      references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE'
    });
    await qi.addConstraint('events', {
      fields: ['calendar_id'], type: 'foreign key', name: 'fk_events_calendar',
      references: { table: 'calendars', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE'
    });

    await qi.addIndex('events', ['school_id','starts_at'], { name: 'idx_events_school_starts' });
    await qi.addIndex('events', ['calendar_id','starts_at'], { name: 'idx_events_calendar_starts' });
    await qi.addIndex('events', ['announcement_id'], { name: 'idx_events_announcement' });
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    try { await qi.removeIndex('events', 'idx_events_school_starts'); } catch {}
    try { await qi.removeIndex('events', 'idx_events_calendar_starts'); } catch {}
    try { await qi.removeIndex('events', 'idx_events_announcement'); } catch {}
    try { await qi.removeConstraint('events', 'fk_events_calendar'); } catch {}
    try { await qi.removeConstraint('events', 'fk_events_school'); } catch {}
    try { await qi.dropTable('events'); } catch {}
  }
};


