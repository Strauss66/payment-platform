import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Student, Enrollment, Class, User } from '../models/index.js';

const r = Router();

// GET /api/courses/me - return the logged-in student's courses
r.get('/me', requireAuth, async (req, res) => {
  try {
    let student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      // Create a basic student record on first access to ensure the portal works
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const firstName = user.username || (user.email ? user.email.split('@')[0] : 'Student');
      student = await Student.create({ user_id: user.id, first_name: firstName, last_name: '', grade: null });
    }

    const enrollments = await Enrollment.findAll({
      where: { student_id: student.id },
      include: [{ model: Class, as: 'class' }]
    });

    const current = enrollments.map(e => ({
      id: e.class?.id,
      name: e.class?.name,
      term: null,
      enrolledAs: 'Student',
      published: true
    })).filter(c => Boolean(c.id));

    return res.json({
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade: student.grade
      },
      current,
      past: []
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default r;


