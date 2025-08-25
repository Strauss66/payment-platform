"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "grading_periods",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        school_year_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        state: { type: Sequelize.ENUM("draft", "open", "closed", "published"), allowNull: false, defaultValue: "draft" },
        publish_requires_approval: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("grading_periods", ["school_id"], { name: "idx_grading_periods_school_id" });
    await queryInterface.addConstraint("grading_periods", { fields: ["school_id"], type: "foreign key", name: "fk_grading_periods_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grading_periods", { fields: ["school_year_id"], type: "foreign key", name: "fk_grading_periods_school_year", references: { table: "school_years", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grading_periods", { fields: ["start_date", "end_date"], type: "check", name: "chk_grading_periods_dates", where: Sequelize.literal("start_date <= end_date") });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("grading_periods");
  }
};


