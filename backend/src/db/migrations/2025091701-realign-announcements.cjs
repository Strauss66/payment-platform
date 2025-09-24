"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const sequelize = qi.sequelize;

    // Create table if missing; otherwise align columns
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'announcements'");
    if (!tables.length) {
      await qi.createTable('announcements', {
        id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        title: { type: Sequelize.STRING(200), allowNull: false },
        body: { type: Sequelize.TEXT, allowNull: false },
        category: { type: Sequelize.ENUM('payments','events','activities','other'), allowNull: false },
        audience_type: { type: Sequelize.ENUM('school','section','class','student'), allowNull: false },
        sections: { type: Sequelize.JSON, allowNull: true },
        class_ids: { type: Sequelize.JSON, allowNull: true },
        student_ids: { type: Sequelize.JSON, allowNull: true },
        starts_at: { type: Sequelize.DATE, allowNull: false },
        ends_at: { type: Sequelize.DATE, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
      }, { underscored: true });
      await qi.addConstraint('announcements', {
        fields: ['school_id'], type: 'foreign key', name: 'fk_announcements_school',
        references: { table: 'schools', field: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE'
      });
    } else {
      // Existing table: perform adjustments
      async function hasColumn(col){
        const [cols] = await sequelize.query("SHOW COLUMNS FROM `announcements` LIKE :c", { replacements: { c: col } });
        return cols.length > 0;
      }
      const enums = {
        category: ['payments','events','activities','other'],
        audience_type: ['school','section','class','student']
      };

      if (!(await hasColumn('category'))) {
        await qi.addColumn('announcements', 'category', { type: Sequelize.ENUM(...enums.category), allowNull: false, defaultValue: 'other' });
      }
      if (await hasColumn('type')) { try { await qi.removeColumn('announcements', 'type'); } catch (e) {}
      }

      if (!(await hasColumn('audience_type'))) {
        await qi.addColumn('announcements', 'audience_type', { type: Sequelize.ENUM(...enums.audience_type), allowNull: false, defaultValue: 'school' });
      }
      if (await hasColumn('audience_scope')) { try { await qi.removeColumn('announcements', 'audience_scope'); } catch (e) {} }

      if (!(await hasColumn('sections'))) {
        await qi.addColumn('announcements', 'sections', { type: Sequelize.JSON, allowNull: true });
      }
      if (!(await hasColumn('class_ids'))) {
        await qi.addColumn('announcements', 'class_ids', { type: Sequelize.JSON, allowNull: true });
      }
      if (!(await hasColumn('student_ids'))) {
        await qi.addColumn('announcements', 'student_ids', { type: Sequelize.JSON, allowNull: true });
      }

      if (!(await hasColumn('starts_at'))) {
        await qi.addColumn('announcements', 'starts_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
      }
      if (!(await hasColumn('ends_at'))) {
        await qi.addColumn('announcements', 'ends_at', { type: Sequelize.DATE, allowNull: true });
      }

      // Rename previous targeting columns to new ones where present
      async function renameIfExists(from, to) {
        try {
          await qi.renameColumn('announcements', from, to);
        } catch (e) {}
      }
      await renameIfExists('target_level_ids', 'sections');
      await renameIfExists('target_class_ids', 'class_ids');
      await renameIfExists('target_student_ids', 'student_ids');
    }
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    // Non-destructive down: remove added columns where possible
    try { await qi.removeColumn('announcements', 'category'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'audience_type'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'sections'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'class_ids'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'student_ids'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'starts_at'); } catch (e) {}
    try { await qi.removeColumn('announcements', 'ends_at'); } catch (e) {}
  }
};
