"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "school_years",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        is_default: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );

    await queryInterface.addIndex("school_years", ["school_id"], { name: "idx_school_years_school_id" });
    await queryInterface.addConstraint("school_years", {
      fields: ["school_id", "name"],
      type: "unique",
      name: "uq_school_years_school_name"
    });
    await queryInterface.addConstraint("school_years", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_school_years_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });

    await queryInterface.addConstraint("school_years", {
      fields: ["start_date", "end_date"],
      type: "check",
      name: "chk_school_years_dates",
      where: Sequelize.literal("start_date < end_date")
    });

    // Back-reference FK for org_prefs.default_school_year_id
    try {
      await queryInterface.addConstraint("org_prefs", {
        fields: ["default_school_year_id"],
        type: "foreign key",
        name: "fk_org_prefs_default_school_year",
        references: { table: "school_years", field: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    } catch (e) {
      // ignore if org_prefs not present yet in fresh setups
    }
  },

  async down(queryInterface) {
    try { await queryInterface.removeConstraint("org_prefs", "fk_org_prefs_default_school_year"); } catch (e) {}
    await queryInterface.dropTable("school_years");
  }
};


