import departmentRoutes from './src/routes/departmentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import studentsRouter from './src/routes/students.js';
import placementRouter from './src/routes/placement.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import Student from './src/models/student.js'
import Admin from './src/models/Admin.js';
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/students', studentsRouter);
app.use('/api/placement', placementRouter);


//api for student login
app.post('/api/student/login', async (req, res) => {
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
});

//api for admin login
// app.post('/api/admin/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(404).json({ success: false, message: "Admin not found" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, type: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRESIN }
//     );

//     const { password: _, ...adminData } = admin.toObject();
//     res.json({ success: true, token, userType: 'admin', admin: adminData });
//     console.log('Admin logged in successfully');

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });



app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
  }
};

startServer();

