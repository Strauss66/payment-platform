"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "groups",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        school_year_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        level_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(16), allowNull: false },
        grade: { type: Sequelize.TINYINT, allowNull: true },
        capacity: { type: Sequelize.SMALLINT, allowNull: true },
        shift: { type: Sequelize.ENUM("MATUTINO", "VESPERTINO"), allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("groups", ["school_id"], { name: "idx_groups_school_id" });
    await queryInterface.addConstraint("groups", { fields: ["school_id", "school_year_id", "code"], type: "unique", name: "uq_groups_school_year_code" });
    await queryInterface.addConstraint("groups", { fields: ["school_id"], type: "foreign key", name: "fk_groups_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("groups", { fields: ["school_year_id"], type: "foreign key", name: "fk_groups_school_year", references: { table: "school_years", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("groups", { fields: ["level_id"], type: "foreign key", name: "fk_groups_level", references: { table: "levels", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("groups");
  }
};


