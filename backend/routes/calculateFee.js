const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get(
  "/late-payers",
  authenticateToken,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const [lateInvoices, metadata] = await sequelize.query(`
        SELECT 
          students.id AS studentId,
          user_profiles.first_name AS studentFirstName,
          user_profiles.last_name AS studentLastName,
          parent_profiles.first_name AS parentFirstName,
          parent_profiles.last_name AS parentLastName,
          invoices.total_amount AS amountDue,
          invoices.invoice_date AS dueDate,
          students.late_fees AS existingLateFee,
          (DATEDIFF(NOW(), invoices.invoice_date) * 5) AS calculatedLateFee,
          (invoices.total_amount + students.late_fees + (DATEDIFF(NOW(), invoices.invoice_date) * 5)) AS finalAmount
        FROM invoices
        JOIN students ON invoices.student_id = students.id
        JOIN users AS student_users ON students.user_id = student_users.id
        JOIN user_profiles ON student_users.id = user_profiles.user_id
        JOIN users AS parent_users ON students.parent_id = parent_users.id
        JOIN user_profiles AS parent_profiles ON parent_users.id = parent_profiles.user_id
        JOIN roles ON parent_users.role_id = roles.id
        WHERE invoices.status = 'unpaid' 
        AND invoices.invoice_date < NOW()
        AND roles.name = 'parent';
      `);

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