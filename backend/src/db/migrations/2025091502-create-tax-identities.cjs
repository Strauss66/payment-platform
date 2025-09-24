"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "tax_identities",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        family_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        type: { type: Sequelize.ENUM('family','student'), allowNull: false, defaultValue: 'family' },
        rfc: { type: Sequelize.STRING(13), allowNull: false },
        name: { type: Sequelize.STRING(200), allowNull: false },
        uso_cfdi: { type: Sequelize.STRING(3), allowNull: false },
        regimen_fiscal_receptor: { type: Sequelize.STRING(4), allowNull: true },
        postal_code: { type: Sequelize.CHAR(5), allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );

    await queryInterface.addIndex("tax_identities", ["school_id", "rfc"], { name: "idx_tax_identities_school_rfc" });
    await queryInterface.addIndex("tax_identities", ["school_id", "type"], { name: "idx_tax_identities_school_type" });

    // Unique constraint: (school_id, type, COALESCE(family_id,0), COALESCE(student_id,0))
    await queryInterface.addConstraint("tax_identities", {
      fields: ["school_id", "type", "family_id", "student_id"],
      type: "unique",
      name: "uq_tax_identity_subject",
    });

    // Foreign keys if available
    try {
      await queryInterface.addConstraint("tax_identities", {
        fields: ["school_id"],
        type: "foreign key",
        name: "fk_tax_identities_school",
        references: { table: "schools", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      });
    } catch (_) {}
    try {
      await queryInterface.addConstraint("tax_identities", {
        fields: ["family_id"],
        type: "foreign key",
        name: "fk_tax_identities_family",
        references: { table: "families", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    } catch (_) {}
    try {
      await queryInterface.addConstraint("tax_identities", {
        fields: ["student_id"],
        type: "foreign key",
        name: "fk_tax_identities_student",
        references: { table: "students", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    } catch (_) {}
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("tax_identities", "fk_tax_identities_student").catch(()=>{});
    await queryInterface.removeConstraint("tax_identities", "fk_tax_identities_family").catch(()=>{});
    await queryInterface.removeConstraint("tax_identities", "fk_tax_identities_school").catch(()=>{});
    await queryInterface.removeConstraint("tax_identities", "uq_tax_identity_subject").catch(()=>{});
    await queryInterface.dropTable("tax_identities");
  }
};


