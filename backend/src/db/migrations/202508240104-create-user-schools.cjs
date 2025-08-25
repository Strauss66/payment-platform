"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "user_schools",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        is_primary: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );

    await queryInterface.addIndex("user_schools", ["school_id"], { name: "idx_user_schools_school_id" });
    await queryInterface.addConstraint("user_schools", {
      fields: ["user_id", "school_id"],
      type: "unique",
      name: "uq_user_schools_user_school"
    });
    await queryInterface.addConstraint("user_schools", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_user_schools_user",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
    await queryInterface.addConstraint("user_schools", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_user_schools_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_schools");
  }
};


