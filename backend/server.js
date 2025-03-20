const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("./config/db");

const app = express();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend requests
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Middleware
app.use(express.json());

// Import models
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const Role = require("./models/role");
const Permission = require("./models/permission");
const RolePermission = require("./models/RolePermission");
const Student = require("./models/Student");
const Family = require("./models/Family");
const Grade = require("./models/Grade");
const Payment = require("./models/Payment");

// Define relationships
Student.hasMany(Payment, { foreignKey: "studentId" });
Payment.belongsTo(Student, { foreignKey: "studentId" });

// Register API routes
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/grades", require("./routes/gradeRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); // ✅ Correct admin panel routes

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");
    app.listen(process.env.PORT || 5001, () => {
      console.log(`Server running on port ${process.env.PORT || 5001}`);
    });
  })
  .catch((err) => {
    console.error("Database sync error:", err);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});