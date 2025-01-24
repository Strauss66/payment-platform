const express = require('express');
const { getPayments, addPayment } = require('../controllers/paymentController');

const router = express.Router();

// Routes for payments
router.get('/', getPayments); // Fetch all payments
router.post('/', addPayment); // Add a new payment

module.exports = router;