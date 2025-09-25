"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    await qi.createTable(
      "invoice_items",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        invoice_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        description: { type: Sequelize.STRING(255), allowNull: false },
        qty: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 1 },
        unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        line_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await qi.addIndex("invoice_items", ["invoice_id"], { name: "idx_invoice_items_invoice_id" });
    await qi.addConstraint("invoice_items", {
      fields: ["invoice_id"],
      type: "foreign key",
      name: "fk_invoice_items_invoice",
      references: { table: "invoices", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invoice_items");
  }
};


