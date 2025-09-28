import express from 'express';
// import { loginAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';
import { uploadStudentCSV } from '../controllers/studentController.js';
import upload from '../middleware/uploadMiddleware.js';
import Student from '../models/student.js'
import Admin from '../models/Admin.js';
import Preference from '../models/preferences.js'
import Department from '../models/Department.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();

// ✅ Admin login route
router.post('/login',async(req,res)=>{
    try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, type: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRESIN }
    );

    const { password: _, ...adminData } = admin.toObject();
    res.json({ success: true, token, userType: 'admin', admin: adminData });
    console.log('Admin logged in successfully');

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


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

// GET: fetch all students
router.get('/viewStudents',async(req,res)=>{
try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})



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
