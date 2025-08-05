import Student from '../models/Student.js';
import Department from '../models/Department.js';
import csv from 'csv-parser';
import fs from 'fs';
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students' });
  }
};
export const getStudentByStudentId = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching student' });
  }
};
// the ff code is used to create students by bulk upload by the admin
export const uploadStudentCSV = async (req, res) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        const inserted = await Student.insertMany(results);
        fs.unlinkSync(req.file.path); // delete file after processing
        res.status(201).json({
          message: `${inserted.length} students uploaded successfully.`,
          data: inserted,
        });
      });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
//the ff code is used to create a student manually by the admin
export const createStudent = async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      gender,
      region,
      entranceScore,
      entranceMax,
      gpa,
      disability,
      disabilityVerified,
      preferences = [] // optional: default to empty
    } = req.body;

    // Check for duplicate student
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Validate preferences if provided
    let validatedPreferences = [];
    if (preferences.length > 0) {
      const departments = await Department.find();
      const validNames = departments.map(d => d.name.toLowerCase());

      const invalid = preferences.filter(p => !validNames.includes(p.toLowerCase()));
      if (invalid.length > 0) {
        return res.status(400).json({
          message: 'Invalid department names in preferences',
          invalidDepartments: invalid
        });
      }

      // Keep original casing from input
      validatedPreferences = preferences;
    }

    // Create the student
    const student = new Student({
      studentId,
      fullName,
      gender,
      region,
      entranceScore,
      entranceMax: entranceMax || 600,
      gpa,
      disability,
      disabilityVerified,
      preferences: validatedPreferences
    });

    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error creating student',
      error: error.message
    });
  }
};

//code for department preference by the student
export const updateStudentPreferences = async (req, res) => {
  const { studentId } = req.params;
  const { preferences } = req.body;

  try {
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate that all departments exist (case-insensitive)
    const departments = await Department.find();
    const validDepartmentNames = departments.map(dept => dept.name.toLowerCase());
    
    const invalidPreferences = preferences.filter(pref => 
      !validDepartmentNames.includes(pref.toLowerCase())
    );

    if (invalidPreferences.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid departments found', 
        invalidDepartments: invalidPreferences 
      });
    }

    // Store department names directly (preserve original case from request)
    student.preferences = preferences;
    await student.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: preferences,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const updateStudentByStudentId = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    Object.assign(student, req.body);
    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const deleteStudentByStudentId = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.remove();
    res.status(200).json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting student' });
  }
};
