const Grade = require('../models/Grade');

// Add a study plan
exports.addStudyPlan = async (req, res) => {
    const { name, details } = req.body;
    try {
        const plan = await Grade.create({ name, details });
        res.json(plan);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding study plan');
    }
};

// Get grades for a student
exports.getGradesByStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const grades = await Grade.findAll({ where: { studentId } });
        res.json(grades);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving grades');
    }
};