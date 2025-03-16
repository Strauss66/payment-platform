const Student = require('../models/Student');

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

const db = require("../config/db"); // Import your database connection

const LATE_FEE_PER_DAY = 5; // $5 per day

exports.getStudentBalance = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await db.query("SELECT * FROM students WHERE id = ?", [studentId]);

    if (!student.length) {
      return res.status(404).json({ error: "Student not found" });
    }

    const invoices = await db.query("SELECT * FROM invoices WHERE student_id = ?", [studentId]);
    
    let totalBalance = 0;
    let currentDate = new Date();

    invoices.forEach((invoice) => {
      let dueDate = new Date(invoice.due_date);
      let daysLate = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));

      let lateFee = daysLate > 0 ? daysLate * LATE_FEE_PER_DAY : 0;
      totalBalance += invoice.amount + lateFee;
    });

    res.json({ balance: totalBalance, invoices });
  } catch (error) {
    console.error("Error fetching student balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};