const express = require("express");
const { getStudents, addStudent, getStudentBalance } = require("../controllers/studentController"); // Import `getStudentBalance`
const router = express.Router();

router.get("/", getStudents);
router.post("/", addStudent);

router.get("/balance/:studentId", getStudentBalance); //Fix the route path

module.exports = router;