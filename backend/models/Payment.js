const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');

// Payment model definition
const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: DataTypes.INTEGER,
        references: {
            model: Student,
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Paid', 'Pending', 'Overdue'),
        defaultValue: 'Pending',
    },
    surcharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
});

module.exports = Payment;