"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    async function hasColumn(col){
      const [cols] = await sequelize.query("SHOW COLUMNS FROM `announcements` LIKE :c", { replacements: { c: col } });
      return cols.length > 0;
    }

    if (!(await hasColumn('role_keys'))) {
      await qi.addColumn('announcements', 'role_keys', { type: Sequelize.JSON, allowNull: true });
    }
    if (!(await hasColumn('image_urls'))) {
      await qi.addColumn('announcements', 'image_urls', { type: Sequelize.JSON, allowNull: true });
    }
    if (!(await hasColumn('image_alts'))) {
      await qi.addColumn('announcements', 'image_alts', { type: Sequelize.JSON, allowNull: true });
    }
  },

  async down(queryInterface) {
    const qi = queryInterface;
    try { await qi.removeColumn('announcements', 'role_keys'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'image_urls'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'image_alts'); } catch (e) {}
  }
};
