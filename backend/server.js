import departmentRoutes from './src/routes/departmentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import studentRoutes from './src/routes/students.js';
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
app.use('/api/student', studentRoutes);
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
//api for submit departments and show first preference students with descending order
app.use('/api/student',studentRoutes)

// app.use('/api/admin',adminRoutes)

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
      let totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);
      if(student.gender==='Female'){
        totalScore +=5
      }
      const emergingRegions = [
        "Afar",
        "Benishangul-Gumuz",
        "Gambela",
        "Somali"
      ];

      // check if student's region is exactly one of them
      if (emergingRegions.includes(student.region)) {
        totalScore += 5;
      }
      if(student.disability!=='none'){
       totalScore +=10 
      }
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
        function calculateTotalScore(gpaOrcgpa, entranceScore) {
      // Convert GPA/CGPA to percentage (assuming 4.0 scale)
      const gpaPercentage = (gpaOrcgpa / 4.0) * 100;
      
      // Normalize entrance score to percentage (out of 600)
      const entrancePercentage = (entranceScore / 600) * 100;
      
      // Calculate weighted total (adjust weights as needed)
      // Example: 50% from GPA/CGPA and 50% from entrance exam
      let totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);
      if(student.gender==='Female'){
        totalScore +=5
      }
      const emergingRegions = [
        "Afar",
        "Benishangul-Gumuz",
        "Gambela",
        "Somali"
      ];

      // check if student's region is exactly one of them
      if (emergingRegions.includes(student.region)) {
        totalScore += 5;
      }
      if(student.disability!=='none'){
       totalScore +=10 
      }
      return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
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




// routes/preferences.js
Router.get('/api/admin/view/preferences', async (req, res) => {
  try {
    const preferences = await Preference.find()
      .populate('student', 'firstName lastName studentId stream gpa gender')
      .populate('department', 'name deptID capacity')
      .sort({ priority: 1, 'student.totalScore': -1 });

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
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

