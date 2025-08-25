"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // study_plans
    await queryInterface.createTable(
      "study_plans",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        level_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        version: { type: Sequelize.STRING(16), allowNull: false },
        is_published: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("study_plans", ["school_id"], { name: "idx_study_plans_school_id" });
    await queryInterface.addConstraint("study_plans", { fields: ["school_id", "level_id", "name", "version"], type: "unique", name: "uq_study_plans_school_level_name_version" });
    await queryInterface.addConstraint("study_plans", { fields: ["school_id"], type: "foreign key", name: "fk_study_plans_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("study_plans", { fields: ["level_id"], type: "foreign key", name: "fk_study_plans_level", references: { table: "levels", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // subjects
    await queryInterface.createTable(
      "subjects",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        study_plan_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(16), allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        credits: { type: Sequelize.TINYINT, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("subjects", ["school_id"], { name: "idx_subjects_school_id" });
    await queryInterface.addConstraint("subjects", { fields: ["school_id", "study_plan_id", "code"], type: "unique", name: "uq_subjects_school_plan_code" });
    await queryInterface.addConstraint("subjects", { fields: ["school_id"], type: "foreign key", name: "fk_subjects_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("subjects", { fields: ["study_plan_id"], type: "foreign key", name: "fk_subjects_study_plan", references: { table: "study_plans", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("subjects");
    await queryInterface.dropTable("study_plans");
  }
};


