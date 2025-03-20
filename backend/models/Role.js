const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM("admin", "cashier", "teacher", "student", "parent"),
      unique: true,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Role;