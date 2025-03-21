const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); // Import User model

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    enrollment: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    group: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_id: { //Ensure `user_id` exists
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // References `User` table
            key: 'id',
        },
        onDelete: 'CASCADE', // If the user is deleted, the student is deleted too
    },
    parent_id: { // Ensure `parent_id` exists
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User, // Assuming parents are also users
            key: 'id',
        },
        onDelete: 'SET NULL',
    }
}, {
    timestamps: true,
});

module.exports = Student;