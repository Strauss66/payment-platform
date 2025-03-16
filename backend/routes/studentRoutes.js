const express = require('express');
const { getStudents, addStudent } = require('../controllers/studentController');
const router = express.Router();

router.get('/', getStudents);
router.post('/', addStudent);

router.get("/student/balance/:studentId", getStudentBalance);

module.exports = router;