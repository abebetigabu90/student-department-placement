import adminAuth from '../middleware/adminAuth.js'
import express from 'express';
import {
  getStudents,
  getStudentByStudentId,
  createStudent,
  updateStudentPreferences,
  updateStudentByStudentId,
  deleteStudentByStudentId,
} from '../controllers/studentController.js';

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(adminAuth,createStudent);

router.put('/:studentId/preferences', updateStudentPreferences);

router.route('/:studentId')
  .get(getStudentByStudentId)
  .put(updateStudentByStudentId)
  .delete(deleteStudentByStudentId);

export default router;
