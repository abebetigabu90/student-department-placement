import express from 'express';
import { createDepartment, getAllDepartments } from '../controllers/departmentController.js';

const router = express.Router();

// Public or admin (depending on auth later)
router.post('/', createDepartment);
router.get('/', getAllDepartments);

export default router;
