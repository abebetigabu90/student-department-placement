import express from 'express';
import { loginAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadStudentCSV } from '../controllers/studentController.js';
import upload from '../middleware/uploadMiddleware.js';
import Student from '../models/student.js'
const router = express.Router();

// ✅ Admin login route
router.post('/login', loginAdmin);


router.post('/create-student', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      studentId,
      password,
      stream,
      gender,
      region
    } = req.body;

    // Simple validation
    if (!firstName || !lastName || !studentId || !password || !stream || !gender || !region) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this ID already exists'
      });
    }

    // Create new student
    const newStudent = new Student({
      firstName: firstName.trim(),
      middleName: middleName ? middleName.trim() : '',
      lastName: lastName.trim(),
      studentId: studentId.trim(),
      password: password,
      stream,
      gender,
      region
    });

    // ✅ MISSING CODE: Save the student to database
    await newStudent.save();

    // ✅ MISSING CODE: Send success response
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        id: newStudent._id,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        studentId: newStudent.studentId,
        stream: newStudent.stream,
        gender: newStudent.gender,
        region: newStudent.region
      }
    });

  } catch (error) {
    // ✅ Add error handling
    console.error('Error creating student:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});


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
