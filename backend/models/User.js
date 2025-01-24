const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// User model definition
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    role: {
        type: DataTypes.ENUM('admin', 'teacher', 'student', 'parent'),
        allowNull: false,
    },
});

module.exports = User;