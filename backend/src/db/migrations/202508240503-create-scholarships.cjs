"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "scholarship_types",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        mode: { type: Sequelize.ENUM("percent", "fixed"), allowNull: false },
        value: { type: Sequelize.DECIMAL(12, 4), allowNull: false },
        stacking_policy: { type: Sequelize.ENUM("forbid"), allowNull: false, defaultValue: "forbid" },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("scholarship_types", ["school_id"], { name: "idx_scholarship_types_school_id" });
    await queryInterface.addConstraint("scholarship_types", { fields: ["school_id", "name"], type: "unique", name: "uq_scholarship_types_school_name" });
    await queryInterface.addConstraint("scholarship_types", { fields: ["school_id"], type: "foreign key", name: "fk_scholarship_types_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    await queryInterface.createTable(
      "scholarships",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        scholarship_type_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        starts: { type: Sequelize.DATEONLY, allowNull: false },
        ends: { type: Sequelize.DATEONLY, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("scholarships", ["school_id"], { name: "idx_scholarships_school_id" });
    await queryInterface.addConstraint("scholarships", { fields: ["student_id", "scholarship_type_id", "starts"], type: "unique", name: "uq_scholarships_student_type_starts" });
    await queryInterface.addConstraint("scholarships", { fields: ["school_id"], type: "foreign key", name: "fk_scholarships_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("scholarships", { fields: ["student_id"], type: "foreign key", name: "fk_scholarships_student", references: { table: "students", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("scholarships", { fields: ["scholarship_type_id"], type: "foreign key", name: "fk_scholarships_type", references: { table: "scholarship_types", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("scholarships");
    await queryInterface.dropTable("scholarship_types");
  }
};


