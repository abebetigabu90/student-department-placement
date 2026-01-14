import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import Student from '../models/student.js'
import Preference from '../models/preferences.js'
import Department from '../models/Department.js'
import { loginRateLimiter } from "../middleware/rateLimiter.js"
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

router.post('/login',loginRateLimiter,async(req,res)=>{
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId ,isDeleted:false});
    // const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
     // ✅ Compare entered password with hashed one
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    const defaultPassword = student.middleName.toLowerCase() + "123";
    const isDefaultPassword = await bcrypt.compare(defaultPassword, student.password);
    // Generate JWT properly
    const token = jwt.sign(
      { id: student._id, type: "student" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRESIN } // <-- make sure this is a string like "1h" or "7d"
    );

    // Remove password before sending response
    const { password: _, ...studentData } = student.toObject();

    res.json({ success: true, token,userType:'student', student: studentData, isDefaultPassword,});
    console.log('Student logged in successfully');

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//the ff api is used for student change password
router.post("/change-password", async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;

    if (!studentId || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing studentId or new password" });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // ✅ Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;

    await student.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post('/preferences/:id',async(req,res)=>{
  try {
    const studentId = req.params.id; // This is the custom studentId like "dtuR0094"
    const { choices } = req.body;

    // Validate request body
    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      return res.status(400).json({ message: "Choices array is required" });
    }

    // Validate student exists - use findOne with studentId field
    const student = await Student.findOne({ studentId: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete old preferences - reference by student's MongoDB _id
    await Preference.deleteMany({ student: student._id });

    // Save new preferences
    const savedPreferences = [];
    const errors = [];

    for (const choice of choices) {
      // Validate choice object
      if (!choice.department || !choice.priority) {
        errors.push(`Invalid choice format for priority ${choice.priority}`);
        continue;
      }

      // Find department by name
      const department = await Department.findOne({ name: choice.department });
      if (!department) {
        errors.push(`Department "${choice.department}" not found`);
        continue;
      }

      try {
        const pref = new Preference({
          student: student._id, // Use student's MongoDB _id for reference
          department: department._id, // Use department's MongoDB _id
          priority: choice.priority,
        });
        await pref.save();
        savedPreferences.push(pref);
      } catch (prefError) {
        errors.push(`Failed to save preference for ${choice.department}: ${prefError.message}`);
      }
    }

    // Check if any preferences were saved successfully
    if (savedPreferences.length === 0) {
      return res.status(400).json({ 
        message: "No preferences were saved", 
        errors: errors 
      });
    }

    res.status(201).json({
      message: "Preferences saved successfully",
      preferences: savedPreferences,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Error saving preferences:", err);
    res.status(500).json({ message: "Server error while saving preferences" });
  }
})

//api for viewing ranking of a department
router.get('/ranking/:departmentName',async(req,res)=>{
try {
    const { departmentName } = req.params;

    // Find the department
    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Get first preference students
    const firstPreferenceStudents = await Preference.find({ 
      department: department._id,
      priority: 1
    });

    if (firstPreferenceStudents.length === 0) {
      return res.json({
        department: departmentName,
        capacity: department.capacity,
        totalApplicants: 0,
        ranking: [],
        message: "No students have selected this department as their first preference"
      });
    }

    // Get student IDs from preferences (these are ObjectIds)
    const studentIds = firstPreferenceStudents.map(pref => pref.student);

    // Get student data using the ObjectIds
    const students = await Student.find({ _id: { $in: studentIds } });

    // Create a map for easy student lookup by _id
    const studentMap = {};
    students.forEach(student => {
      studentMap[student._id.toString()] = student;
    });

    // Create ranking data with student information
    let rankingData = firstPreferenceStudents.map((pref) => {
      const student = studentMap[pref.student.toString()];
      if (!student) return null;

      return {
        studentId: student.studentId,
        studentName: student.name,
        gpa: student.gpa,
        entranceScore: student.entranceScore,
        totalScore: student.totalScore,
        priority: pref.priority
      };
    }).filter(Boolean);

    // Sort by totalScore descending (highest score first)
  rankingData.sort((a, b) => {
  if (b.totalScore !== a.totalScore) {
    return b.totalScore - a.totalScore;
  }
  // If total scores are equal, sort by GPA
  return b.gpa - a.gpa;
  });

    // Assign ranks based on the sorted order
    rankingData.forEach((student, index) => {
      student.rank = index + 1;
    });

    res.json({
      department: departmentName,
      capacity: department.capacity,
      totalApplicants: rankingData.length,
      ranking: rankingData,
      note: "Students sorted by total score (highest to lowest)"
    });

  } catch (err) {
    console.error("Error fetching ranking:", err);
    res.status(500).json({ message: "Server error while fetching ranking" });
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