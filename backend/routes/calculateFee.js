const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ensure correct DB import
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get(
  "/late-payers",
  authenticateToken, // Require authentication
  authorizeRole("admin"), // Ensure only admins can access
  async (req, res) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0]; // Format date to YYYY-MM-DD

      const [lateInvoices] = await db.query(
        `
SELECT 
    students.id AS studentId,
    user_profiles.first_name AS studentFirstName,
    user_profiles.last_name AS studentLastName,
    parent_profiles.first_name AS parentFirstName,
    parent_profiles.last_name AS parentLastName,
    invoices.total_amount AS amountDue,
    invoices.invoice_date AS dueDate,
    (DATEDIFF(CURDATE(), invoices.invoice_date) * 5) AS lateFee, 
    (invoices.total_amount + (DATEDIFF(CURDATE(), invoices.invoice_date) * 5)) AS finalAmount
FROM invoices
JOIN students ON invoices.student_id = students.id
JOIN users AS student_users ON students.user_id = student_users.id
JOIN user_profiles ON student_users.id = user_profiles.user_id
LEFT JOIN users AS parent_users ON students.parent_id = parent_users.id
LEFT JOIN user_profiles AS parent_profiles ON parent_users.id = parent_profiles.user_id
WHERE invoices.invoice_date < CURDATE() 
AND invoices.status = 'unpaid';
        `,
        [currentDate, currentDate, currentDate]
      );

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