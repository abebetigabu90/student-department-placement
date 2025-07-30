import express from 'express';
import { loginAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadStudentCSV } from '../controllers/studentController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ✅ Admin login route
router.post('/login', loginAdmin);

// ✅ Protected test route
router.get('/protected', adminAuth, (req, res) => {
  res.json({ message: `Welcome ${req.admin.email}` });
});

// ✅ CSV upload route (with file upload middleware)
router.post(
  '/upload-csv',
  adminAuth,
  upload.single('file'), // This handles the file upload
  uploadStudentCSV       // This processes and saves the data
);

export default router;
