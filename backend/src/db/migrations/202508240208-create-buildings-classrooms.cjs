"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // buildings
    await queryInterface.createTable(
      "buildings",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(32), allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("buildings", ["school_id"], { name: "idx_buildings_school_id" });
    await queryInterface.addConstraint("buildings", { fields: ["school_id", "code"], type: "unique", name: "uq_buildings_school_code" });
    await queryInterface.addConstraint("buildings", { fields: ["school_id"], type: "foreign key", name: "fk_buildings_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // classrooms
    await queryInterface.createTable(
      "classrooms",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        building_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        code: { type: Sequelize.STRING(32), allowNull: false },
        capacity: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addConstraint("classrooms", { fields: ["building_id", "code"], type: "unique", name: "uq_classrooms_building_code" });
    await queryInterface.addConstraint("classrooms", { fields: ["building_id"], type: "foreign key", name: "fk_classrooms_building", references: { table: "buildings", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("classrooms");
    await queryInterface.dropTable("buildings");
  }
};


