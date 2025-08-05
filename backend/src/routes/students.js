import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {
  getStudents,
  getStudentByStudentId,
  createStudent,
  updateStudentPreferences,
  updateStudentByStudentId,
  deleteStudentByStudentId,
} from '../controllers/studentController.js';

const router = express.Router();

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