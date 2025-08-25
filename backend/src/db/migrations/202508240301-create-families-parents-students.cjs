"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    async function safeCreateTable(name, attrs, options) {
      try { await qi.createTable(name, attrs, options); } catch (e) {}
    }
    async function safeAddIndex(table, fields, options) {
      try { await qi.addIndex(table, fields, options); } catch (e) {}
    }
    async function safeAddConstraint(table, opts) {
      try { await qi.addConstraint(table, opts); } catch (e) {}
    }
    // families
    await safeCreateTable(
      "families",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(20), allowNull: false },
        surname: { type: Sequelize.STRING(120), allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await safeAddIndex("families", ["school_id"], { name: "idx_families_school_id" });
    await safeAddConstraint("families", { fields: ["school_id", "code"], type: "unique", name: "uq_families_school_code" });
    await safeAddConstraint("families", { fields: ["school_id"], type: "foreign key", name: "fk_families_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // parents
    await safeCreateTable(
      "parents",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        family_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        first_name: { type: Sequelize.STRING(120), allowNull: false },
        last_name: { type: Sequelize.STRING(120), allowNull: false },
        email: { type: Sequelize.STRING(191), allowNull: true },
        phone: { type: Sequelize.STRING(32), allowNull: true },
        is_primary_guardian: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await safeAddIndex("parents", ["school_id"], { name: "idx_parents_school_id" });
    await safeAddIndex("parents", ["family_id"], { name: "idx_parents_family_id" });
    await safeAddConstraint("parents", { fields: ["school_id"], type: "foreign key", name: "fk_parents_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await safeAddConstraint("parents", { fields: ["family_id"], type: "foreign key", name: "fk_parents_family", references: { table: "families", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await safeAddConstraint("parents", { fields: ["user_id"], type: "foreign key", name: "fk_parents_user", references: { table: "users", field: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });

    // Note: Students table already exists from the initial schema and is used by models.
    // We intentionally do not recreate or modify it here to avoid duplication.
  },

  async down(queryInterface) {
    await queryInterface.dropTable("parents");
    await queryInterface.dropTable("families");
  }
};


