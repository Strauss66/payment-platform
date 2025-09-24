"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    // Composite indexes to accelerate queries
    try { await qi.addIndex('announcements', ['school_id', 'starts_at'], { name: 'idx_announcements_school_starts' }); } catch {}
    try { await qi.addIndex('announcements', ['school_id', 'created_at'], { name: 'idx_announcements_school_created' }); } catch {}
    try { await qi.addIndex('announcements', ['school_id', 'category', 'starts_at'], { name: 'idx_announcements_school_category_starts' }); } catch {}
  },

  async down(queryInterface) {
    const qi = queryInterface;
    try { await qi.removeIndex('announcements', 'idx_announcements_school_starts'); } catch {}
    try { await qi.removeIndex('announcements', 'idx_announcements_school_created'); } catch {}
    try { await qi.removeIndex('announcements', 'idx_announcements_school_category_starts'); } catch {}
  }
};


