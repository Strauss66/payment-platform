const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Use 'mssql' if using MSSQL
    logging: false, // Disable SQL logs
});

// Test connection
sequelize.authenticate()
    .then(() => console.log(' Database connected...'))
    .catch(err => console.error(' Database connection error:', err));

module.exports = sequelize;  // Ensure this is properly exported