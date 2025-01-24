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