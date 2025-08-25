"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // enrollment_periods
    await queryInterface.createTable(
      "enrollment_periods",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        school_year_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        type: { type: Sequelize.ENUM("new", "re"), allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        public_link_enabled: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("enrollment_periods", ["school_id"], { name: "idx_enrollment_periods_school_id" });
    await queryInterface.addConstraint("enrollment_periods", { fields: ["school_id"], type: "foreign key", name: "fk_enrollment_periods_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("enrollment_periods", { fields: ["school_year_id"], type: "foreign key", name: "fk_enrollment_periods_school_year", references: { table: "school_years", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("enrollment_periods", { fields: ["start_date", "end_date"], type: "check", name: "chk_enrollment_periods_dates", where: Sequelize.literal("start_date <= end_date") });

    // timetables
    await queryInterface.createTable(
      "timetables",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        group_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        classroom_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        day_of_week: { type: Sequelize.TINYINT, allowNull: false },
        starts: { type: Sequelize.TIME, allowNull: false },
        ends: { type: Sequelize.TIME, allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("timetables", ["school_id"], { name: "idx_timetables_school_id" });
    await queryInterface.addConstraint("timetables", { fields: ["group_id", "day_of_week", "starts", "ends"], type: "unique", name: "uq_timetables_group_day_start_end" });
    await queryInterface.addConstraint("timetables", { fields: ["school_id"], type: "foreign key", name: "fk_timetables_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("timetables", { fields: ["group_id"], type: "foreign key", name: "fk_timetables_group", references: { table: "groups", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("timetables", { fields: ["classroom_id"], type: "foreign key", name: "fk_timetables_classroom", references: { table: "classrooms", field: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("timetables");
    await queryInterface.dropTable("enrollment_periods");
  }
};


