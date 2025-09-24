"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Extend announcements with targeting, scheduling and type
    async function safeAdd(name, col, def) { try { await queryInterface.addColumn(name, col, def); } catch (e) {} }
    async function safeChange(name, col, def) { try { await queryInterface.changeColumn(name, col, def); } catch (e) {} }
    async function safeAddIndex(table, fields, options) { try { await queryInterface.addIndex(table, fields, options); } catch (e) {} }

    await safeAdd("announcements", "type", { type: Sequelize.STRING(40), allowNull: false, defaultValue: "general" });
    await safeAdd("announcements", "audience_scope", { type: Sequelize.ENUM("all", "levels", "classes", "students"), allowNull: false, defaultValue: "all" });
    await safeAdd("announcements", "target_level_ids", { type: Sequelize.JSON, allowNull: true });
    await safeAdd("announcements", "target_class_ids", { type: Sequelize.JSON, allowNull: true });
    await safeAdd("announcements", "target_student_ids", { type: Sequelize.JSON, allowNull: true });
    await safeAdd("announcements", "starts_at", { type: Sequelize.DATE, allowNull: true });
    await safeAdd("announcements", "ends_at", { type: Sequelize.DATE, allowNull: true });

    // Optional helpful indexes
    await safeAddIndex("announcements", ["school_id", "starts_at", "ends_at"], { name: "idx_ann_school_active" });
  },

  async down(queryInterface) {
    async function safeRemove(name, col) { try { await queryInterface.removeColumn(name, col); } catch (e) {} }
    async function safeRemoveIndex(table, name) { try { await queryInterface.removeIndex(table, name); } catch (e) {} }
    await safeRemoveIndex("announcements", "idx_ann_school_active");
    await safeRemove("announcements", "type");
    await safeRemove("announcements", "audience_scope");
    await safeRemove("announcements", "target_level_ids");
    await safeRemove("announcements", "target_class_ids");
    await safeRemove("announcements", "target_student_ids");
    await safeRemove("announcements", "starts_at");
    await safeRemove("announcements", "ends_at");
  }
};


