const express = require('express');
const { addStudyPlan, getGradesByStudent } = require('../controllers/gradeController');

const router = express.Router();

// Routes for grades
router.post('/study-plan', addStudyPlan);          // Add a study plan
router.get('/:studentId', getGradesByStudent);     // Get grades for a specific student

module.exports = router;