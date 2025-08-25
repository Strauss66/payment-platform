"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "procedure_types",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        sla_days: { type: Sequelize.INTEGER, allowNull: false },
        requires_payment: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        form_schema_json: { type: Sequelize.JSON, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("procedure_types", ["school_id"], { name: "idx_procedure_types_school_id" });
    await queryInterface.addConstraint("procedure_types", { fields: ["school_id", "name"], type: "unique", name: "uq_procedure_types_school_name" });
    await queryInterface.addConstraint("procedure_types", { fields: ["school_id"], type: "foreign key", name: "fk_procedure_types_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("procedure_types");
  }
};


