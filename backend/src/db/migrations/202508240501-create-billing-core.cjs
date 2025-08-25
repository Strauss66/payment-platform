"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // charge_concepts
    await queryInterface.createTable(
      "charge_concepts",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(16), allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        type: { type: Sequelize.ENUM("tuition", "fee", "product"), allowNull: false },
        taxable: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("charge_concepts", ["school_id"], { name: "idx_charge_concepts_school_id" });
    await queryInterface.addConstraint("charge_concepts", { fields: ["school_id", "code"], type: "unique", name: "uq_charge_concepts_school_code" });
    await queryInterface.addConstraint("charge_concepts", { fields: ["school_id"], type: "foreign key", name: "fk_charge_concepts_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // products
    await queryInterface.createTable(
      "products",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        charge_concept_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        sku: { type: Sequelize.STRING(32), allowNull: false },
        price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        stock: { type: Sequelize.INTEGER, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("products", ["school_id"], { name: "idx_products_school_id" });
    await queryInterface.addConstraint("products", { fields: ["school_id", "sku"], type: "unique", name: "uq_products_school_sku" });
    await queryInterface.addConstraint("products", { fields: ["school_id"], type: "foreign key", name: "fk_products_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("products", { fields: ["charge_concept_id"], type: "foreign key", name: "fk_products_charge_concept", references: { table: "charge_concepts", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // payment_methods
    await queryInterface.createTable(
      "payment_methods",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        requires_ref: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("payment_methods", ["school_id"], { name: "idx_payment_methods_school_id" });
    await queryInterface.addConstraint("payment_methods", { fields: ["school_id", "name"], type: "unique", name: "uq_payment_methods_school_name" });
    await queryInterface.addConstraint("payment_methods", { fields: ["school_id"], type: "foreign key", name: "fk_payment_methods_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // tuition_plans
    await queryInterface.createTable(
      "tuition_plans",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        level_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        currency: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: "MXN" },
        amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 4000.0 },
        schedule: { type: Sequelize.ENUM("monthly"), allowNull: false, defaultValue: "monthly" },
        penalties_json: { type: Sequelize.JSON, allowNull: true },
        is_active: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("tuition_plans", ["school_id"], { name: "idx_tuition_plans_school_id" });
    await queryInterface.addConstraint("tuition_plans", { fields: ["school_id", "level_id", "name"], type: "unique", name: "uq_tuition_plans_school_level_name" });
    await queryInterface.addConstraint("tuition_plans", { fields: ["school_id"], type: "foreign key", name: "fk_tuition_plans_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("tuition_plans", { fields: ["level_id"], type: "foreign key", name: "fk_tuition_plans_level", references: { table: "levels", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // billing_prefs
    await queryInterface.createTable(
      "billing_prefs",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, unique: true },
        late_initial_pct: { type: Sequelize.DECIMAL(5, 4), allowNull: false, defaultValue: 0.1 },
        late_compound_mo_pct: { type: Sequelize.DECIMAL(5, 4), allowNull: false, defaultValue: 0.015 },
        debtor_access: { type: Sequelize.ENUM("allow", "view_only", "block"), allowNull: false, defaultValue: "view_only" },
        dunning_json: { type: Sequelize.JSON, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("billing_prefs", ["school_id"], { name: "idx_billing_prefs_school_id" });
    await queryInterface.addConstraint("billing_prefs", { fields: ["school_id"], type: "foreign key", name: "fk_billing_prefs_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("billing_prefs");
    await queryInterface.dropTable("tuition_plans");
    await queryInterface.dropTable("payment_methods");
    await queryInterface.dropTable("products");
    await queryInterface.dropTable("charge_concepts");
  }
};


