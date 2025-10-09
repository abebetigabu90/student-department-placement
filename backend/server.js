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
app.use('/api/admin/setting',adminRoutes);

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
app.get('/api/admin/view/stuPreferences', async (req, res) => {
  try {
    const allPreferences = await Preference.find()
      .populate('student', 'studentId firstName middleName stream region gpa cgpa totalScore entranceScore')
      .populate('department', 'name')
      .sort({priority: 1 });

    // Group by student      
    const preferencesByStudent = {};
    
    allPreferences.forEach(pref => {
          if (!pref.student) {
          console.warn('Preference missing student:', pref._id);
          return;
          }
      const studentId = pref.student._id.toString();
      if (!preferencesByStudent[studentId]) {
        preferencesByStudent[studentId] = {
          _id: studentId,
          firstName: pref.student.firstName,
          middleName: pref.student.middleName,
          studentId: pref.student.studentId,
          stream:pref.student.stream,
          region:pref.student.region,
          gpa:pref.student.gpa,
          entranceScore:pref.student.entranceScore,
          totalScore:pref.student.totalScore,
          priority1: '',
          priority2: '',
          priority3: '',
          priority4: '',
          priority5: '',
          priority6:''
        };
      }
      
      // Assign department to priority column
      preferencesByStudent[studentId][`priority${pref.priority}`] = pref.department.name;
    });

    const result = Object.values(preferencesByStudent);
    const sorted = result.sort((a,b)=>b.totalScore - a.totalScore)
    res.json(sorted);
    console.log(sorted)
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});


//the ff api used to show the placements of students for admin
app.get('/api/admin/viewPlacements',async(req,res)=>{
  try {
    const placedStudents = await Student.find({ 
      Department: { $ne: null } 
    })
    .populate('Department', 'name deptID')
    .select('studentId firstName middleName gender gpa entranceScore totalScore Department')
    .sort({ totalScore: -1 });

    res.json(placedStudents);
  } catch (error) {
    console.error('Error fetching placed students:', error);
    res.status(500).json({ error: 'Failed to fetch placed students' });
  }
})


//the ff api is used for file upload of student
// routes/students.js
import multer from 'multer';
import XLSX from 'xlsx';
// Configure multer for file upload
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an Excel file'));
    }
  }
});

// Import students route
app.post('/api/admin/import/students', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log(`Processing ${jsonData.length} students from uploaded file`);

    const students = [];
    let errorCount = 0;

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Check required fields
        if (!row.firstname) throw new Error('Missing firstname');
        if (!row.IDNo) throw new Error('Missing student ID');
        if (!row.region) throw new Error('Missing region');
        if (!row.Stream) throw new Error('Missing stream');
        if (!row.Gender) throw new Error('Missing gender');
        if (!row.CGPA) throw new Error('Missing CGPA');
        if (!row.G12) throw new Error('Missing entrance score (G12)');
        if (!row.Total70) throw new Error('Missing total score');

        const student = {
          firstName: row.firstname,
          middleName: row.middlename,
          lastName: row.lastName,
          studentId: row.IDNo,
          region: row.region,
          stream: row.Stream,
          gender: row.Gender,
          gpa: row.CGPA,
          entranceScore: row.G12,
          totalScore: row.Total70,
          password: (row.middlename || 'student') + '123'
        };

        students.push(student);
      } catch (error) {
        console.log(`Row ${i + 2} error: ${error.message}`);
        errorCount++;
      }
    }

    // Insert into database
    if (students.length > 0) {
      await Student.insertMany(students);
    }

    res.json({
      message: `Imported ${students.length} students successfully${errorCount > 0 ? `, ${errorCount} records skipped due to errors` : ''}`,
      imported: students.length,
      errors: errorCount
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed: ' + error.message });
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

