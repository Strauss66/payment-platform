const { authenticateToken, authorizeRole } = require("./authMiddleware");

app.get(
  "/api/admin/late-payers",
  authenticateToken, // Require authentication
  authorizeRole("admin"), // Ensure only admins can access
  async (req, res) => {
    try {
      const currentDate = new Date();

      const lateInvoices = await db.query(
        `
        SELECT 
          students.id AS studentId,
          students.first_name AS studentFirstName,
          students.last_name AS studentLastName,
          parents.first_name AS parentFirstName,
          parents.last_name AS parentLastName,
          invoices.amount AS amountDue,
          invoices.due_date AS dueDate,
          (DATEDIFF(?, invoices.due_date) * 5) AS lateFee, 
          (invoices.amount + (DATEDIFF(?, invoices.due_date) * 5)) AS finalAmount
        FROM invoices
        JOIN students ON invoices.user_id = students.id
        JOIN parents ON students.user_id = parents.user_id
        WHERE invoices.due_date < ?`,
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