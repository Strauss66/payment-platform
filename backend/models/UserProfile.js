const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const UserProfile = sequelize.define("UserProfile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false,
});

User.hasOne(UserProfile, { foreignKey: "user_id", onDelete: "CASCADE" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

module.exports = UserProfile;