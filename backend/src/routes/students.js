import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import Student from '../models/student.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  getStudents,
  getStudentByStudentId,
  createStudent,
  updateStudentPreferences,
  updateStudentByStudentId,
  deleteStudentByStudentId,
} from '../controllers/studentController.js';
const router = express.Router();

router.post('/login',async(req,res)=>{
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Compare directly (plain text, not recommended for production)
    if (student.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate JWT properly
    const token = jwt.sign(
      { id: student._id, type: "student" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRESIN } // <-- make sure this is a string like "1h" or "7d"
    );

    // Remove password before sending response
    const { password: _, ...studentData } = student.toObject();

    res.json({ success: true, token,userType:'student', student: studentData });
    console.log('Student logged in successfully');

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})



// GET /api/students - Get all students
router.get('/', getStudents);

// POST /api/students - Create a new student (admin only)
router.post('/', adminAuth, createStudent);

// GET /api/students/:studentId - Get specific student by studentId
router.get('/:studentId', getStudentByStudentId);

// PUT /api/students/:studentId - Update student by studentId
router.put('/:studentId', updateStudentByStudentId);

// DELETE /api/students/:studentId - Delete student by studentId (admin only)
router.delete('/:studentId', adminAuth, deleteStudentByStudentId);

// PUT /api/students/:studentId/preferences - Update student preferences
router.put('/:studentId/preferences', updateStudentPreferences);

export default router;