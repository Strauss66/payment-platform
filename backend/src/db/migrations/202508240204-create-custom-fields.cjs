"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "custom_fields",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        model: { type: Sequelize.ENUM("student", "parent", "teacher", "invoice", "payment"), allowNull: false },
        type: { type: Sequelize.ENUM("text", "number", "date", "enum", "bool"), allowNull: false },
        key: { type: Sequelize.STRING(64), allowNull: false },
        label: { type: Sequelize.STRING(120), allowNull: false },
        required: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        options: { type: Sequelize.JSON, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("custom_fields", ["school_id"], { name: "idx_custom_fields_school_id" });
    await queryInterface.addConstraint("custom_fields", { fields: ["school_id", "model", "key"], type: "unique", name: "uq_custom_fields_school_model_key" });
    await queryInterface.addConstraint("custom_fields", { fields: ["school_id"], type: "foreign key", name: "fk_custom_fields_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("custom_fields");
  }
};


