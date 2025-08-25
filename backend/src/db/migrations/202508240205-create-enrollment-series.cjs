"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "enrollment_series",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        prefix: { type: Sequelize.STRING(10), allowNull: false },
        next_number: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        padding: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 5 },
        per_level: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("enrollment_series", ["school_id"], { name: "idx_enrollment_series_school_id" });
    await queryInterface.addConstraint("enrollment_series", { fields: ["school_id", "prefix"], type: "unique", name: "uq_enrollment_series_school_prefix" });
    await queryInterface.addConstraint("enrollment_series", { fields: ["school_id"], type: "foreign key", name: "fk_enrollment_series_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("enrollment_series");
  }
};


