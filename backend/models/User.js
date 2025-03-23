const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Role = require("./Role");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Assign a default role ID
      references: {
        model: Role,
        key: "id",
      },
      onDelete: "SET DEFAULT",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "locked"),
      defaultValue: "active",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true, // Keep timestamps enabled
  }
);

// Relationships
User.belongsTo(Role, { foreignKey: "role_id", onDelete: "SET NULL" });
Role.hasMany(User, { foreignKey: "role_id" });

module.exports = User;