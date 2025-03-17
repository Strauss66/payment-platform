const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");  // Use the correct import
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");  //  Correct path

router.get(
  "/late-payers",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const [lateInvoices, metadata] = await sequelize.query(`
        SELECT 
  students.id AS studentId,
  students.first_name AS studentFirstName,
  students.last_name AS studentLastName,
  users.name AS parentName,
  invoices.total_amount AS amountDue,
  invoices.invoice_date AS dueDate,
  (DATEDIFF(NOW(), invoices.invoice_date) * 5) AS lateFee,
  (invoices.total_amount + (DATEDIFF(NOW(), invoices.invoice_date) * 5)) AS finalAmount
FROM invoices
JOIN students ON invoices.student_id = students.id
JOIN users ON students.user_id = users.id
WHERE invoices.status = 'unpaid' 
AND invoices.invoice_date < NOW()
AND users.role = 'student_parent';`);

      if (!lateInvoices.length) {
        return res.json({ message: "No late payers found" });
      }

      res.json(lateInvoices);
    } catch (error) {
      console.error("Error fetching late payers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router; 