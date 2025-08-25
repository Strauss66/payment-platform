"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "grade_reviews",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        grading_period_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        scope: { type: Sequelize.ENUM("group", "student"), allowNull: false },
        state: { type: Sequelize.ENUM("pending", "approved", "rejected"), allowNull: false, defaultValue: "pending" },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("grade_reviews", ["school_id"], { name: "idx_grade_reviews_school_id" });
    await queryInterface.addConstraint("grade_reviews", { fields: ["school_id"], type: "foreign key", name: "fk_grade_reviews_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("grade_reviews", { fields: ["grading_period_id"], type: "foreign key", name: "fk_grade_reviews_period", references: { table: "grading_periods", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    await queryInterface.createTable(
      "report_ack_windows",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        grading_period_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("report_ack_windows", ["school_id"], { name: "idx_report_ack_windows_school_id" });
    await queryInterface.addConstraint("report_ack_windows", { fields: ["school_id"], type: "foreign key", name: "fk_report_ack_windows_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("report_ack_windows", { fields: ["grading_period_id"], type: "foreign key", name: "fk_report_ack_windows_period", references: { table: "grading_periods", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    await queryInterface.createTable(
      "report_acks",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        grading_period_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        acknowledged_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("report_acks", ["school_id"], { name: "idx_report_acks_school_id" });
    await queryInterface.addConstraint("report_acks", { fields: ["school_id"], type: "foreign key", name: "fk_report_acks_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("report_acks", { fields: ["student_id"], type: "foreign key", name: "fk_report_acks_student", references: { table: "students", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("report_acks", { fields: ["grading_period_id"], type: "foreign key", name: "fk_report_acks_period", references: { table: "grading_periods", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("report_acks", { fields: ["student_id", "grading_period_id"], type: "unique", name: "uq_report_acks_student_period" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("report_acks");
    await queryInterface.dropTable("report_ack_windows");
    await queryInterface.dropTable("grade_reviews");
  }
};


