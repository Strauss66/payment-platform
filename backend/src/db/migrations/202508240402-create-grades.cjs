"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "grades",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        subject_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        group_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        grading_period_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        score: { type: Sequelize.DECIMAL(4, 2), allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("grades", ["school_id"], { name: "idx_grades_school_id" });
    await queryInterface.addConstraint("grades", { fields: ["student_id", "subject_id", "grading_period_id"], type: "unique", name: "uq_grades_student_subject_period" });
    await queryInterface.addConstraint("grades", { fields: ["school_id"], type: "foreign key", name: "fk_grades_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grades", { fields: ["student_id"], type: "foreign key", name: "fk_grades_student", references: { table: "students", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grades", { fields: ["subject_id"], type: "foreign key", name: "fk_grades_subject", references: { table: "subjects", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grades", { fields: ["group_id"], type: "foreign key", name: "fk_grades_group", references: { table: "groups", field: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
    await queryInterface.addConstraint("grades", { fields: ["grading_period_id"], type: "foreign key", name: "fk_grades_grading_period", references: { table: "grading_periods", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("grades");
  }
};


