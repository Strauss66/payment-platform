"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // org_prefs
    await queryInterface.createTable(
      "org_prefs",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, unique: true },
        default_school_year_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        timezone: { type: Sequelize.STRING(64), allowNull: true },
        contact_emails: { type: Sequelize.JSON, allowNull: true },
        privacy_url: { type: Sequelize.STRING(191), allowNull: true },
        privacy_verified: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("org_prefs", ["school_id"], { name: "idx_org_prefs_school_id" });
    await queryInterface.addConstraint("org_prefs", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_org_prefs_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
    // Note: default_school_year_id FK will be added after school_years table exists (separate migration)

    // global_prefs
    await queryInterface.createTable(
      "global_prefs",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, unique: true },
        grades_layout: { type: Sequelize.ENUM("vertical", "horizontal"), allowNull: false, defaultValue: "vertical" },
        debtor_portal: { type: Sequelize.ENUM("allow", "view_only", "block"), allowNull: false, defaultValue: "view_only" },
        show_aux_data: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        show_comments: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        calendar_weekends: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        allow_email_change: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        allow_password_change: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        home_widgets: { type: Sequelize.JSON, allowNull: true },
        social_links: { type: Sequelize.JSON, allowNull: true },
        dm_matrix: { type: Sequelize.JSON, allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("global_prefs", ["school_id"], { name: "idx_global_prefs_school_id" });
    await queryInterface.addConstraint("global_prefs", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_global_prefs_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });

    // audience_flags
    await queryInterface.createTable(
      "audience_flags",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, primaryKey: true, autoIncrement: true },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        audience: { type: Sequelize.ENUM("parent", "student", "teacher"), allowNull: false },
        feature_key: { type: Sequelize.STRING(64), allowNull: false },
        enabled: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        mobile_enabled: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        hours: { type: Sequelize.STRING(64), allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("audience_flags", ["school_id"], { name: "idx_audience_flags_school_id" });
    await queryInterface.addConstraint("audience_flags", {
      fields: ["school_id"],
      type: "foreign key",
      name: "fk_audience_flags_school",
      references: { table: "schools", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
    await queryInterface.addConstraint("audience_flags", {
      fields: ["school_id", "audience", "feature_key"],
      type: "unique",
      name: "uq_audience_flags_school_audience_feature"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audience_flags");
    await queryInterface.dropTable("global_prefs");
    await queryInterface.dropTable("org_prefs");
  }
};


