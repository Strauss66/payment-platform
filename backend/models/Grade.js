const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Grade model definition
const Grade = sequelize.define('Grade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    grade: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
});

module.exports = Grade;