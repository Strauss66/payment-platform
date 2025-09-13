"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "invoicing_entities",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(160), allowNull: false },
        tax_id: { type: Sequelize.STRING(32), allowNull: true },
        tax_system_code: { type: Sequelize.STRING(16), allowNull: true },
        email: { type: Sequelize.STRING(191), allowNull: true },
        phone: { type: Sequelize.STRING(32), allowNull: true },
        address_json: { type: Sequelize.JSON, allowNull: true },
        is_default: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );

    await queryInterface.addIndex("invoicing_entities", ["school_id"], { name: "idx_invoicing_entities_school_id" });
    await queryInterface.addConstraint("invoicing_entities", {
      fields: ["school_id", "name"],
      type: "unique",
      name: "uq_invoicing_entities_school_name"
    });
    await queryInterface.addConstraint("invoicing_entities", {
      fields: ["school_id", "tax_id"],
      type: "unique",
      name: "uq_invoicing_entities_school_tax"
    });
    await queryInterface.addConstraint("invoicing_entities", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_invoicing_entities_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invoicing_entities");
  }
};
