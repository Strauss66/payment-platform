const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permission = sequelize.define("Permission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: false,
});

module.exports = Permission;