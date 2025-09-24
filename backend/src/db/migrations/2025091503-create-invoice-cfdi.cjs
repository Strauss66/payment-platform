"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "invoice_cfdi",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        invoice_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        status: { type: Sequelize.ENUM('none','draft','stamped','canceled'), allowNull: false, defaultValue: 'none' },
        uuid: { type: Sequelize.STRING(36), allowNull: true },
        stamped_at: { type: Sequelize.DATE, allowNull: true },
        canceled_at: { type: Sequelize.DATE, allowNull: true },
        serie: { type: Sequelize.STRING(25), allowNull: true },
        folio: { type: Sequelize.STRING(40), allowNull: true },
        xml: { type: Sequelize.TEXT('medium'), allowNull: true },
        tfd_xml: { type: Sequelize.TEXT('long'), allowNull: true },
        cancel_reason: { type: Sequelize.STRING(2), allowNull: true },
        cancel_replacement_uuid: { type: Sequelize.STRING(36), allowNull: true },
        qrcode_png: { type: Sequelize.BLOB('long'), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );

    await queryInterface.addConstraint("invoice_cfdi", {
      fields: ["invoice_id"],
      type: "unique",
      name: "uq_invoice_cfdi_invoice"
    });

    await queryInterface.addIndex("invoice_cfdi", ["school_id", "uuid"], { name: "idx_invoice_cfdi_school_uuid" });
    await queryInterface.addIndex("invoice_cfdi", ["school_id", "status"], { name: "idx_invoice_cfdi_school_status" });

    // Foreign keys
    try {
      await queryInterface.addConstraint("invoice_cfdi", {
        fields: ["school_id"],
        type: "foreign key",
        name: "fk_invoice_cfdi_school",
        references: { table: "schools", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    } catch (_) {}
    try {
      await queryInterface.addConstraint("invoice_cfdi", {
        fields: ["invoice_id"],
        type: "foreign key",
        name: "fk_invoice_cfdi_invoice",
        references: { table: "invoices", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      });
    } catch (_) {}
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("invoice_cfdi", "fk_invoice_cfdi_invoice").catch(()=>{});
    await queryInterface.removeConstraint("invoice_cfdi", "fk_invoice_cfdi_school").catch(()=>{});
    await queryInterface.removeIndex("invoice_cfdi", "idx_invoice_cfdi_school_status").catch(()=>{});
    await queryInterface.removeIndex("invoice_cfdi", "idx_invoice_cfdi_school_uuid").catch(()=>{});
    await queryInterface.removeConstraint("invoice_cfdi", "uq_invoice_cfdi_invoice").catch(()=>{});
    await queryInterface.dropTable("invoice_cfdi");
  }
};


