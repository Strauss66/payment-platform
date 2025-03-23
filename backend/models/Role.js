const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); // Import the User model

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
    hooks: {
      beforeDestroy: async (role) => {
        const userCount = await User.count({ where: { role_id: role.id } });
        if (userCount > 0) {
          throw new Error("Cannot delete a role assigned to users.");
        }
      },
    },
    timestamps: false,
  }
);

module.exports = Role;