import departmentRoutes from './src/routes/departmentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import studentsRouter from './src/routes/students.js';
import placementRouter from './src/routes/placement.js';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import Department from './src/models/Department.js'
import Preference from './src/models/preferences.js'
import Student from './src/models/student.js'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentsRouter);
app.use('/api/departments', departmentRoutes);
app.use('/api/placement', placementRouter);

app.post('/logout',async(req,res)=>{
  try{res.json({message:'loged out successfully!'})}
  catch(e){
    console.error(e)
    return res.status(500).json({error:'internal server error'})
  }
})

app.get("/api/student/:id", async (req, res) => {
  try {
    // Use findOne with studentId field instead of findById
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find({ stream: 'natural' });

    if (!departments || departments.length === 0) {
      return res.status(404).json({ message: 'No departments recorded in the department document!' });
    }

    return res.status(200).json(departments);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});


app.post("/api/student/preferences/:id", async (req, res) => {
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
});



// Simple ranking - just show first preference students
app.get("/api/ranking/:departmentName", async (req, res) => {
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

    // Create ranking data
    const rankingData = firstPreferenceStudents.map((pref, index) => {
      const student = studentMap[pref.student.toString()];
      if (!student) return null;

      return {
        rank: index + 1,
        studentId: student.studentId, // Your custom student ID
        studentName: student.name,
        gpa: student.gpa,
        entranceScore: student.entranceScore,
        totalScore: student.totalScore,
        priority: pref.priority
      };
    }).filter(Boolean);

    res.json({
      department: departmentName,
      capacity: department.capacity,
      totalApplicants: rankingData.length,
      ranking: rankingData,
      note: "Showing all students who selected this department as first preference"
    });

  } catch (err) {
    console.error("Error fetching ranking:", err);
    res.status(500).json({ message: "Server error while fetching ranking" });
  }
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

