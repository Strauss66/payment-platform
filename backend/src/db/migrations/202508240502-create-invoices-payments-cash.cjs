"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // invoices
    await queryInterface.createTable(
      "invoices",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        student_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        charge_concept_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        period_month: { type: Sequelize.TINYINT, allowNull: true },
        period_year: { type: Sequelize.SMALLINT, allowNull: true },
        due_date: { type: Sequelize.DATEONLY, allowNull: false },
        subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        discount_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        tax_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        late_fee_accrued: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        paid_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        balance: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        status: { type: Sequelize.ENUM("open", "partial", "paid", "void"), allowNull: false, defaultValue: "open" },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("invoices", ["school_id"], { name: "idx_invoices_school_id" });
    await queryInterface.addConstraint("invoices", { fields: ["student_id", "charge_concept_id", "period_month", "period_year"], type: "unique", name: "uq_invoices_student_concept_period" });
    await queryInterface.addConstraint("invoices", { fields: ["school_id"], type: "foreign key", name: "fk_invoices_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("invoices", { fields: ["student_id"], type: "foreign key", name: "fk_invoices_student", references: { table: "students", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("invoices", { fields: ["charge_concept_id"], type: "foreign key", name: "fk_invoices_charge_concept", references: { table: "charge_concepts", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // payment_methods exists
    await queryInterface.createTable(
      "payments",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        invoice_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        payment_method_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        paid_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        ref: { type: Sequelize.STRING(64), allowNull: true },
        cashier_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        note: { type: Sequelize.STRING(255), allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("payments", ["school_id"], { name: "idx_payments_school_id" });
    await queryInterface.addConstraint("payments", { fields: ["school_id"], type: "foreign key", name: "fk_payments_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("payments", { fields: ["invoice_id"], type: "foreign key", name: "fk_payments_invoice", references: { table: "invoices", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("payments", { fields: ["payment_method_id"], type: "foreign key", name: "fk_payments_payment_method", references: { table: "payment_methods", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("payments", { fields: ["cashier_user_id"], type: "foreign key", name: "fk_payments_cashier_user", references: { table: "users", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    await queryInterface.createTable(
      "cash_registers",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        location: { type: Sequelize.STRING(120), allowNull: true },
        is_active: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("cash_registers", ["school_id"], { name: "idx_cash_registers_school_id" });
    await queryInterface.addConstraint("cash_registers", { fields: ["school_id", "name"], type: "unique", name: "uq_cash_registers_school_name" });
    await queryInterface.addConstraint("cash_registers", { fields: ["school_id"], type: "foreign key", name: "fk_cash_registers_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    await queryInterface.createTable(
      "cash_sessions",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        cash_register_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        opened_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        opened_at: { type: Sequelize.DATE, allowNull: false },
        closed_at: { type: Sequelize.DATE, allowNull: true },
        totals_json: { type: Sequelize.JSON, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("cash_sessions", ["school_id"], { name: "idx_cash_sessions_school_id" });
    await queryInterface.addConstraint("cash_sessions", { fields: ["school_id"], type: "foreign key", name: "fk_cash_sessions_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("cash_sessions", { fields: ["cash_register_id"], type: "foreign key", name: "fk_cash_sessions_register", references: { table: "cash_registers", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("cash_sessions", { fields: ["opened_by"], type: "foreign key", name: "fk_cash_sessions_opened_by", references: { table: "users", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cash_sessions");
    await queryInterface.dropTable("cash_registers");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("invoices");
  }
};


