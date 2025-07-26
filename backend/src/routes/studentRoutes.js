import express from 'express';
import {
  getStudents,
  getStudentByStudentId,
  createStudent,
  updateStudentByStudentId,
  deleteStudentByStudentId,
} from '../controllers/studentController.js';

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:studentId')
  .get(getStudentByStudentId)
  .put(updateStudentByStudentId)
  .delete(deleteStudentByStudentId);

export default router;
