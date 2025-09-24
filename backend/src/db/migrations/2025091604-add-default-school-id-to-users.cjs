"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    async function columnExists(table, column) {
      const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE :col`, { replacements: { col: column } });
      return cols.length > 0;
    }

    if (!(await columnExists('users', 'default_school_id'))) {
      await qi.addColumn('users', 'default_school_id', {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true
      });
      try {
        await qi.addConstraint('users', {
          fields: ['default_school_id'],
          type: 'foreign key',
          name: 'fk_users_default_school_id',
          references: { table: 'schools', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      } catch (e) {}
    }

    // Backfill default_school_id when a single mapping exists in user_schools or users.school_id present
    try {
      await sequelize.query(`
        UPDATE users u
        LEFT JOIN (
          SELECT us.user_id, MIN(us.school_id) AS school_id, COUNT(*) AS cnt
          FROM user_schools us
          GROUP BY us.user_id
        ) m ON m.user_id = u.id
        SET u.default_school_id = COALESCE(u.default_school_id, CASE WHEN m.cnt = 1 THEN m.school_id ELSE NULL END, u.school_id)
      `);
    } catch (e) {}
  },

  async down(queryInterface) {
    const qi = queryInterface;
    try { await qi.removeConstraint('users', 'fk_users_default_school_id'); } catch (e) {}
    try { await qi.removeColumn('users', 'default_school_id'); } catch (e) {}
  }
};


