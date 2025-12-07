import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from './src/config/db.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import studentRoutes from './src/routes/students.js';
import placementRouter from './src/routes/placement.js';
import express from 'express';
import Department from './src/models/Department.js'
import Preference from './src/models/preferences.js'
import Student from './src/models/student.js'
import Registrar from './src/models/Registrar.js'
import PreferenceSetting from './src/models/PreferenceSetting.js'
import Placement from './src/models/Placement.js'
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
//app.use('/api/admin/GetDepartments', departmentRoutes);
app.use('/api/admin/placement', placementRouter);
app.use('/api/admin/setting',adminRoutes);
//the ff api is used to check registrar login
app.post('/api/registrar/login',async(req,res)=>{
      try {
      const { email, password } = req.body;
  
      const registrar = await Registrar.findOne({ email });
      if (!registrar) {
        return res.status(404).json({ success: false, message: "Registrar not found" });
      }
  
      const isMatch = await bcrypt.compare(password, registrar.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }
  
      const token = jwt.sign(
        { id: registrar._id, type: "registrar" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRESIN }
      );
  
      const { password: _, ...registrarData } = registrar.toObject();
      res.json({ success: true, token, userType: 'registrar', registrar: registrarData });
      console.log('Registrar logged in successfully');
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
})
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

//the ff api used to filter first semister student departments separately for natural and social students
app.get('/api/departments/FirstSem/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findOne({ studentId: studentId }).populate('Department');
    if (!student) {
      console.error(`Student not found: ${studentId}`);
      return res.status(404).json({ message: 'Student not found!' });
    }
    
    let departments;
    const preferenceSetting = await PreferenceSetting.findOne()
    // if(student.Department.PrefTypeCategory === 'Unique' || student.Department.PrefTimeCategory === 'SecSemFirst')
    // if(student.Department.isFinalPref) {
    //          return res.json({message:`No More! Preference You Have Been Placed in ${student.Department.name}`})
    //     }
    if (student?.Department?.isFinalPref) {
    return res.json({
        message: `No More! Preference You Have Been Placed in ${student.Department.name}`
    });
    }
    if(preferenceSetting.isFirstSemPrefEnabled === true){
          if (student.stream.toLowerCase().startsWith('n') && student.isAssigned === false) {
            // Natural Science stream
               departments = await Department.find({ stream: 'natural', PrefTimeCategory: 'FirstSem' });
               if (!departments || departments.length === 0) {
               console.error(`No departments found for student ${studentId} in stream ${student.stream}`);
               return res.status(404).json({ message: 'No departments recorded in the department document!' });
                 }

               return res.status(200).json(departments);
              }
          if(student.stream.toLowerCase().startsWith('s') && student.isAssigned === false) {
                // Social Science stream
                departments = await Department.find({ stream: 'social', PrefTimeCategory: 'FirstSem' });
                if (!departments || departments.length === 0) {
                console.error(`No departments found for student ${studentId} in stream ${student.stream}`);
                return res.status(404).json({ message: 'No departments recorded in the department document!' });
                }
                return res.status(200).json(departments);
          }
    }
    //the ff is used to filter departments for second semister preference
    if(preferenceSetting.isSecSemPrefEnabled === true){
          if (student.Department.PrefTypeCategory === 'PreEngineering') {
            //  engineering preferences for the semister 2 students
               departments = await Department.find({ PrefTypeCategory: 'PreEngineering', PrefTimeCategory: 'SecSemFirst' });
               if (!departments || departments.length === 0) {
               console.error(`No departments found for student ${studentId} in stream ${student.stream}`);
               return res.status(404).json({ message: 'No departments recorded in the department document!' });
                 }

               return res.status(200).json(departments);
              }
          if(student.Department.PrefTypeCategory === 'OtherNatural') {
                //other natural preferences for the semister 2 students
                departments = await Department.find({ PrefTypeCategory: 'OtherNatural', PrefTimeCategory: 'SecSemFirst' });
                if (!departments || departments.length === 0) {
                console.error(`No departments found for student ${studentId} in stream ${student.stream}`);
                return res.status(404).json({ message: 'No departments recorded in the department document!' });
                }
                return res.status(200).json(departments);
          }
          if(student.Department.PrefTypeCategory === 'OtherSocial') {
                //other social preferences for the semister 2 students
                departments = await Department.find({ PrefTypeCategory: 'OtherSocial', PrefTimeCategory: 'SecSemFirst' });
                if (!departments || departments.length === 0) {
                console.error(`No departments found for student ${studentId} in stream ${student.stream}`);
                return res.status(404).json({ message: 'No departments recorded in the department document!' });
                }
                return res.status(200).json(departments);
          }

          
    }
     else{
      return res.json({message:'Please Wait Until We Announce The Date of Department Preference!'})
     }     
  }
  catch (e) {
    console.error(`Error fetching departments for student ${studentId}:`, e.stack || e);
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
// app.put('/api/students/:id/updateGrades', async (req, res) => {
//   try {
//     const { gpaOrcgpa, entranceScore } = req.body;
    
//     // Validate input
//     if (!gpaOrcgpa || !entranceScore) {
//       return res.status(400).json({ 
//         message: 'GPA/CGPA and entrance score are required' 
//       });
//     }

//     if (gpaOrcgpa < 0 || gpaOrcgpa > 4.0) {
//       return res.status(400).json({ 
//         message: 'GPA/CGPA must be between 0.0 and 4.0' 
//       });
//     }

//     if (entranceScore < 0 || entranceScore > 600) {
//       return res.status(400).json({ 
//         message: 'Entrance score must be between 0 and 700' 
//       });
//     }

//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
//         function calculateTotalScore(gpaOrcgpa, entranceScore) {
//       // Convert GPA/CGPA to percentage (assuming 4.0 scale)
//       const gpaPercentage = (gpaOrcgpa / 4.0) * 100;
      
//       // Normalize entrance score to percentage (out of 600)
//       const entrancePercentage = (entranceScore / 600) * 100;
      
//       // Calculate weighted total (adjust weights as needed)
//       // Example: 50% from GPA/CGPA and 50% from entrance exam
//       let totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);
//       if(student.gender==='Female'){
//         totalScore +=5
//       }
//       const emergingRegions = [
//         "Afar",
//         "Benishangul-Gumuz",
//         "Gambela",
//         "Somali"
//       ];

//       // check if student's region is exactly one of them
//       if (emergingRegions.includes(student.region)) {
//         totalScore += 5;
//       }
//       if(student.disability!=='none'){
//        totalScore +=10 
//       }
//       return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
//     }

//     // Calculate total score
//     const totalScore = calculateTotalScore(gpaOrcgpa, entranceScore);

//     // Update student grades
//     student.gpa = gpaOrcgpa;
//     student.entranceScore = entranceScore;
//     student.totalScore = totalScore;
//     const updatedStudent = await student.save();
    
//     res.json({
//       message: 'Grades updated successfully',
//       student: updatedStudent
//     });
//   } catch (error) {
//     console.error('Error updating grades:', error);
//     res.status(400).json({ 
//       message: 'Failed to update grades',
//       error: error.message 
//     });
//   }
// });
app.patch('/api/students/:id', async (req, res) => {
  try {
    const updates = req.body;  // Only the fields sent from frontend
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // === APPLY ONLY PROVIDED FIELDS ===
    if (updates.studentId !== undefined) student.studentId = updates.studentId;
    if (updates.firstName !== undefined) student.firstName = updates.firstName;
    if (updates.middleName !== undefined) student.middleName = updates.middleName;
    if (updates.gender !== undefined) student.gender = updates.gender;
    if (updates.stream !== undefined) student.stream = updates.stream;

    // GPA + Entrance Score (optional)
    if (updates.gpaOrcgpa !== undefined) student.gpa = updates.gpaOrcgpa;
    if (updates.entranceScore !== undefined) student.entranceScore = updates.entranceScore;

    // Recalculate totalScore only if grades were updated
    if (updates.gpaOrcgpa !== undefined || updates.entranceScore !== undefined) {
      function calculateTotalScore(gpaOrcgpa, entranceScore) {
        const gpaPercentage = (gpaOrcgpa / 4.0) * 100;
        const entrancePercentage = (entranceScore / 600) * 100;

        let totalScore = (gpaPercentage * 0.5) + (entrancePercentage * 0.2);

        if (student.gender === 'Female') totalScore += 5;

        const emergingRegions = ["Afar", "Benishangul-Gumuz", "Gambela", "Somali"];
        if (emergingRegions.includes(student.region)) totalScore += 5;

        if (student.disability !== 'none') totalScore += 10;

        return Math.round(totalScore * 100) / 100;
      }

      student.totalScore = calculateTotalScore(
        student.gpa,
        student.entranceScore
      );
    }

    const updatedStudent = await student.save();

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    res.status(400).json({ message: error.message });
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
app.get('/api/admin/viewAllPlacements',async(req,res)=>{
  try {
    const placedStudents = await Student.find({ 
      Department: { $ne: null } 
    })
    .populate('Department', 'name deptID')
    // .select('studentId firstName middleName gender gpa entranceScore totalScore Department')
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
        if (!row.disability) throw new Error('Missing disability');
        // Generate raw password
        const rawPassword = (row.middlename) + '123';

        // Hash password
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const student = {
          firstName: row.firstname,
          middleName: row.middlename,
          lastName: row.lastName,
          studentId: row.IDNo,
          disability:row.disability,
          region: row.region,
          stream: row.Stream,
          gender: row.Gender,
          gpa: row.CGPA,
          entranceScore: row.G12,
          totalScore: row.Total70,
          password: hashedPassword
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


//the ff api used for admin to manage departments
//the ff api used to view departments
app.get('/api/view/departments',async(req,res)=>{
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})
//the ff api used to updated departments
app.put('/api/update/department/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ message: `${field} already exists` });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ message: errors.join(', ') });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
//the ff api is used to create departments
app.post('/api/create/department', async (req, res) => {
  try {
    console.log('Creating department:', req.body);
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    console.log('Create error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ message: `${field} already exists` });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ message: errors.join(', ') });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});
//the ff api used to delete departments
app.delete('/api/delete/department/:id',async(req,res)=>{
    try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})
//the ff api used for a student to show his preferences
// routes/preferences.js
// routes/preferences.js
app.get('/api/my/preferences/:studentCode', async (req, res) => {
  try {
    // First find the student by studentCode
    const student = await Student.findOne({ studentId: req.params.studentCode });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Then find preferences using the student's ObjectId
    const preferences = await Preference.find({ student: student._id })
      .populate("department", "name deptID")
      .sort("priority");
    
    //console.log(preferences);
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching preferences"
    });
  }
});
//the ff api is used to show placement for any student
app.get('/api/my/placement/:id',async(req,res)=>{
  try {
    const student = await Student.findOne({studentId:req.params.id})
    const placement = await Placement.findOne({ student: student._id})
      .populate('department', 'name')
      .populate('student', 'firstName studentId')
    if (!placement) {
      console.log('not placed!')
      return res.status(404).json({
        success: false,
        message: 'No placement found for this student'
      });
    }
    res.json({
      success: true,
      placement: placement
    });
  } catch (error) {
    console.error('Error fetching placement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
})
//the ff api is for admind dashboard
app.get('/api/admin/dashboard',async(req,res)=>{
  try {
    const totalStudents = await Student.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const placedStudents = await Student.countDocuments({ Department: { $ne: null } });
    const femaleStudents = await Student.countDocuments({gender: { $regex: /^F/i }})
    res.json({
      totalStudents,
      totalDepartments,
      placedStudents,
      femaleStudents
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
})
//the ff api is used for view students
app.get('/api/admin/view/students',async(req,res)=>{
      try {
        const students = await Student.find().select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
})
//the ff api used for student account update
// app.patch('/api/admin/updateStudentAccount/:id', async (req, res) => {
//     try {
//         const { AccountStatus } = req.body;
//         const student = await Student.findByIdAndUpdate(
//             req.params.id,
//             { AccountStatus },
//             { new: true }
//         ).select('-password');
//         res.json(student);
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating student', error: error.message });
//     }
// });
//the ff api of registrar used to delete student 
app.delete('/api/registrar/delete/student/:id',async(req,res)=>{
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student' });
  }
})
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

