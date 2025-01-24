const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Family model definition
const Family = sequelize.define('Family', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Family;