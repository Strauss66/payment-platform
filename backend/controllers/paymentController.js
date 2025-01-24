const Payment = require('../models/Payment');

// Get all payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        res.json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Add a new payment
exports.addPayment = async (req, res) => {
    const { studentId, amount, dueDate, method } = req.body;
    try {
        const payment = await Payment.create({
            studentId,
            amount,
            dueDate,
            method,
            status: 'Pending',
        });
        res.json(payment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};