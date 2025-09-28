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



// show first preference students with descending order
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
});



// GET: fetch all students
app.get("/api/viewStudents", async (req, res) => {
    try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Add grades to student
app.post('/api/students/:id/grades', async (req, res) => {
  try {
    const { gpaOrcgpa, entranceScore } = req.body;
    
    // Validate input
    if (!gpaOrcgpa || !entranceScore) {
      return res.status(400).json({ 
        message: 'GPA/CGPA and entrance score are required' 
      });
    }

    if (gpaOrcgpa < 0 || gpaOrcgpa > 4.0) {
      return res.status(400).json({ 
        message: 'GPA/CGPA must be between 0.0 and 4.0' 
      });
    }

    if (entranceScore < 0 || entranceScore > 600) {
      return res.status(400).json({ 
        message: 'Entrance score must be between 0 and 600' 
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

        // Helper function to calculate total score
    function calculateTotalScore(gpaOrcgpa, entranceScore) {
      // Convert GPA/CGPA to percentage (assuming 4.0 scale)
      const gpaPercentage = (gpaOrcgpa / 4.0) * 100;
      
      // Normalize entrance score to percentage (out of 600)
      const entrancePercentage = (entranceScore / 600) * 100;
      
      // Calculate weighted total (adjust weights as needed)
      // Example: 50% from GPA/CGPA and 50% from entrance exam
      const totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);
      
      return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    }
    // Calculate total score (you can adjust the formula as needed)
    const totalScore = calculateTotalScore(gpaOrcgpa, entranceScore);

    // Update student with grades
    student.gpa = gpaOrcgpa;
    student.entranceScore = entranceScore;
    student.totalScore = totalScore;
    const updatedStudent = await student.save();
    
    res.json({
      message: 'Grades added successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error adding grades:', error);
    res.status(400).json({ 
      message: 'Failed to add grades',
      error: error.message 
    });
  }
});



// Update student grades
app.put('/api/students/:id/updateGrades', async (req, res) => {
  try {
    const { gpaOrcgpa, entranceScore } = req.body;
    
    // Validate input
    if (!gpaOrcgpa || !entranceScore) {
      return res.status(400).json({ 
        message: 'GPA/CGPA and entrance score are required' 
      });
    }

    if (gpaOrcgpa < 0 || gpaOrcgpa > 4.0) {
      return res.status(400).json({ 
        message: 'GPA/CGPA must be between 0.0 and 4.0' 
      });
    }

    if (entranceScore < 0 || entranceScore > 600) {
      return res.status(400).json({ 
        message: 'Entrance score must be between 0 and 700' 
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate total score
    const totalScore = calculateTotalScore(gpaOrcgpa, entranceScore);

    // Update student grades
    student.gpa = gpaOrcgpa;
    student.entranceScore = entranceScore;
    student.totalScore = totalScore;
    const updatedStudent = await student.save();
    
    res.json({
      message: 'Grades updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating grades:', error);
    res.status(400).json({ 
      message: 'Failed to update grades',
      error: error.message 
    });
  }
});

// Helper function to calculate total score
function calculateTotalScore(gpaOrcgpa, entranceScore) {
  // Convert GPA/CGPA to percentage (assuming 4.0 scale)
  const gpaPercentage = (gpaOrcgpa / 4.0) * 100;
  
  // Normalize entrance score to percentage (out of 700)
  const entrancePercentage = (entranceScore / 600) * 100;
  
  // Calculate weighted total (adjust weights as needed)
  // Example: 50% from GPA/CGPA and 50% from entrance exam
  const totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);
  
  return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
}



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

