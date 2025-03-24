const { QueryTypes } = require("sequelize");
const db = require("../config/db"); 

const LATE_FEE_PER_DAY = 5; // $5 per day

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.addStudent = async (req, res) => {
    try {
        const { name, email, grade } = req.body;
        const student = await Student.create({ name, email, grade });
        res.json(student);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};


exports.getStudentBalance = async (req, res) => {
  const { studentId } = req.params;
  try {
    const students = await db.query("SELECT * FROM students WHERE id = :studentId", {
      replacements: { studentId },
      type: QueryTypes.SELECT,
    });

    if (!students.length) {
      return res.status(404).json({ error: "Student not found" });
    }

    const invoices = await db.query("SELECT * FROM invoices WHERE student_id = :studentId", {
      replacements: { studentId },
      type: QueryTypes.SELECT,
    });

    let totalBalance = 0;
    let currentDate = new Date();

    invoices.forEach((invoice) => {
      let dueDate = new Date(invoice.invoice_date); // Use invoice date as a reference
      let daysLate = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));

      let lateFee = daysLate > 0 ? daysLate * LATE_FEE_PER_DAY : 0;
      totalBalance += parseFloat(invoice.total_amount) + lateFee;
    });

    res.json({ balance: totalBalance, invoices });
  } catch (error) {
    console.error("Error fetching student balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};