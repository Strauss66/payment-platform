const Student = require('../models/Student');
const Payment = require('../models/Payment');

// Generate student population report
exports.getStudentPopulation = async (req, res) => {
    try {
        const students = await Student.findAll();
        const report = students.reduce((acc, student) => {
            acc[student.grade] = (acc[student.grade] || 0) + 1;
            return acc;
        }, {});
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating student population report');
    }
};

// Generate payment report
exports.getPaymentReport = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        const totalIncome = payments.reduce((acc, payment) => acc + payment.amount, 0);
        res.json({ totalIncome });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating payment report');
    }
};