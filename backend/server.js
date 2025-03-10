const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Force load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);

const cors = require('cors');
const sequelize = require('./config/db');
const Student = require('./models/Student');
const Family = require('./models/Family');
const Grade = require('./models/Grade');
const Payment = require('./models/Payment');

Student.hasMany(Payment, { foreignKey: 'studentId' });
Payment.belongsTo(Student, { foreignKey: 'studentId' });

sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
});

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
    });
}

// Sync database and start server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database sync error:', err);
});