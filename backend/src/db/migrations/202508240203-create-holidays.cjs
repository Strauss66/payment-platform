"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "holidays",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("holidays", ["school_id", "start_date", "end_date"], { name: "idx_holidays_school_dates" });
    await queryInterface.addConstraint("holidays", { fields: ["school_id"], type: "foreign key", name: "fk_holidays_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("holidays", { fields: ["start_date", "end_date"], type: "check", name: "chk_holidays_dates", where: Sequelize.literal("start_date <= end_date") });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("holidays");
  }
};


