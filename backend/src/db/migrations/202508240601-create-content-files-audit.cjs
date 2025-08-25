"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // announcements
    await queryInterface.createTable(
      "announcements",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        title: { type: Sequelize.STRING(191), allowNull: false },
        body: { type: Sequelize.TEXT, allowNull: true },
        is_public: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("announcements", ["school_id"], { name: "idx_announcements_school_id" });
    await queryInterface.addConstraint("announcements", { fields: ["school_id"], type: "foreign key", name: "fk_announcements_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // calendar_events
    await queryInterface.createTable(
      "calendar_events",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        title: { type: Sequelize.STRING(191), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        start_date: { type: Sequelize.DATE, allowNull: false },
        end_date: { type: Sequelize.DATE, allowNull: true },
        is_public: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("calendar_events", ["school_id"], { name: "idx_calendar_events_school_id" });
    await queryInterface.addConstraint("calendar_events", { fields: ["school_id"], type: "foreign key", name: "fk_calendar_events_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // banners
    await queryInterface.createTable(
      "banners",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        text: { type: Sequelize.STRING(255), allowNull: false },
        is_public: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("banners", ["school_id"], { name: "idx_banners_school_id" });
    await queryInterface.addConstraint("banners", { fields: ["school_id"], type: "foreign key", name: "fk_banners_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // links
    await queryInterface.createTable(
      "links",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        label: { type: Sequelize.STRING(191), allowNull: false },
        url: { type: Sequelize.STRING(191), allowNull: false },
        is_public: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("links", ["school_id"], { name: "idx_links_school_id" });
    await queryInterface.addConstraint("links", { fields: ["school_id"], type: "foreign key", name: "fk_links_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // files
    await queryInterface.createTable(
      "files",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        owner_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        audience: { type: Sequelize.ENUM("student", "parent", "teacher", "admin"), allowNull: false },
        size: { type: Sequelize.INTEGER, allowNull: false },
        expires_at: { type: Sequelize.DATE, allowNull: true },
        s3_key: { type: Sequelize.STRING(191), allowNull: false },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("files", ["school_id", "expires_at"], { name: "idx_files_school_expires" });
    await queryInterface.addConstraint("files", { fields: ["school_id"], type: "foreign key", name: "fk_files_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("files", { fields: ["owner_user_id"], type: "foreign key", name: "fk_files_owner_user", references: { table: "users", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });

    // audit_logs
    await queryInterface.createTable(
      "audit_logs",
      {
        id: { type: Sequelize.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
        school_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        actor_user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        entity: { type: Sequelize.STRING(64), allowNull: false },
        entity_id: { type: Sequelize.BIGINT, allowNull: false },
        action: { type: Sequelize.STRING(32), allowNull: false },
        before_json: { type: Sequelize.JSON, allowNull: true },
        after_json: { type: Sequelize.JSON, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") }
      },
      { engine: "InnoDB", charset: "utf8mb4", collate: "utf8mb4_0900_ai_ci" }
    );
    await queryInterface.addIndex("audit_logs", ["school_id"], { name: "idx_audit_logs_school_id" });
    await queryInterface.addConstraint("audit_logs", { fields: ["school_id"], type: "foreign key", name: "fk_audit_logs_school", references: { table: "schools", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
    await queryInterface.addConstraint("audit_logs", { fields: ["actor_user_id"], type: "foreign key", name: "fk_audit_logs_actor_user", references: { table: "users", field: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
    await queryInterface.dropTable("files");
    await queryInterface.dropTable("links");
    await queryInterface.dropTable("banners");
    await queryInterface.dropTable("calendar_events");
    await queryInterface.dropTable("announcements");
  }
};


