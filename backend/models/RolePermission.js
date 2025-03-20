const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Role = require("./role");
const Permission = require("./permission");

const RolePermission = sequelize.define("RolePermission", {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Role, key: "id" },
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Permission, key: "id" },
  },
}, {
  timestamps: false,
});

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id" });

module.exports = RolePermission;