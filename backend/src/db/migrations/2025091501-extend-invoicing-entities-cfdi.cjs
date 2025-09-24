"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add CFDI-related columns to invoicing_entities
    await queryInterface.addColumn("invoicing_entities", "rfc", { type: Sequelize.STRING(13), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "regimen_fiscal", { type: Sequelize.STRING(4), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "csd_cert_b64", { type: Sequelize.TEXT("long"), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "csd_key_enc", { type: Sequelize.TEXT("long"), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "csd_key_iv", { type: Sequelize.BLOB("tiny"), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "csd_pass_enc", { type: Sequelize.TEXT("long"), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "pac_provider", { type: Sequelize.STRING(32), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "pac_credentials", { type: Sequelize.JSON, allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "cert_serial", { type: Sequelize.STRING(40), allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "cert_valid_from", { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn("invoicing_entities", "cert_valid_to", { type: Sequelize.DATE, allowNull: true });

    // Index on (school_id, rfc)
    await queryInterface.addIndex("invoicing_entities", ["school_id", "rfc"], {
      name: "idx_invoicing_entities_school_rfc"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("invoicing_entities", "idx_invoicing_entities_school_rfc");
    await queryInterface.removeColumn("invoicing_entities", "cert_valid_to");
    await queryInterface.removeColumn("invoicing_entities", "cert_valid_from");
    await queryInterface.removeColumn("invoicing_entities", "cert_serial");
    await queryInterface.removeColumn("invoicing_entities", "pac_credentials");
    await queryInterface.removeColumn("invoicing_entities", "pac_provider");
    await queryInterface.removeColumn("invoicing_entities", "csd_pass_enc");
    await queryInterface.removeColumn("invoicing_entities", "csd_key_iv");
    await queryInterface.removeColumn("invoicing_entities", "csd_key_enc");
    await queryInterface.removeColumn("invoicing_entities", "csd_cert_b64");
    await queryInterface.removeColumn("invoicing_entities", "regimen_fiscal");
    await queryInterface.removeColumn("invoicing_entities", "rfc");
  }
};


