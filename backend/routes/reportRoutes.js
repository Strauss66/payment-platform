const express = require('express');
const { getStudentPopulation, getPaymentReport } = require('../controllers/reportController');

const router = express.Router();

// Routes for reports
router.get('/student-population', getStudentPopulation); // Generate student population report
router.get('/payment-report', getPaymentReport);         // Generate payment report

module.exports = router;