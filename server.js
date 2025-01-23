const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', require('./routes/studentRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const sequelize = require('./config/db');
sequelize.sync({ force: false }).then(() => {
    console.log('Database connected!');
});