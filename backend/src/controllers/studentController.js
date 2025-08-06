import Student from '../models/Student.js';
import Department from '../models/Department.js';
import csv from 'csv-parser';
import fs from 'fs';
import { CONFIG } from '../services/placementService.js';

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
      semester1GPA,
      semester2GPA,
      cgpa,
      disability,
      disabilityVerified,
      preferences = [] // optional: default to empty - should be in priority order
    } = req.body;

    // Check for duplicate student
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Validate preferences if provided
    let validatedPreferences = [];
    if (preferences.length > 0) {
      // For Semester 1, validate against all possible choices
      const allChoices = [
        'Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law',
        'Engineering', 'Other Health', 'Agriculture and Statistics', 'Other Natural Science',
        'Other Social Science'
      ];

      const invalid = preferences.filter(p => !allChoices.includes(p));
      if (invalid.length > 0) {
        return res.status(400).json({
          message: 'Invalid department names in preferences',
          invalidDepartments: invalid,
          validChoices: allChoices
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
      semester1GPA,
      semester2GPA,
      cgpa,
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

    // Validate preferences based on placement stage
    if (student.placementStage === 'admitted') {
      // Semester 1 preferences
      const allChoices = [
        'Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law',
        'Engineering', 'Other Health', 'Agriculture and Statistics', 'Other Natural Science',
        'Other Social Science'
      ];
      
      const invalidPreferences = preferences.filter(pref => 
        !allChoices.includes(pref)
      );

      if (invalidPreferences.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid preferences for Semester 1', 
          invalidPreferences,
          validChoices: allChoices
        });
      }
    } else if (student.placementStage === 'after-sem1') {
      // Semester 2 preferences - need to determine based on their Semester 1 choice
      const semester1Choice = student.preferences[0]; // Their first choice from Semester 1
      
      if (CONFIG.finalDepartments.has(semester1Choice)) {
        return res.status(400).json({ 
          message: 'Student already placed in final department in Semester 1' 
        });
      }
      
      // Get available departments for their stream
      const streamConfig = CONFIG.streams[semester1Choice];
      if (!streamConfig) {
        return res.status(400).json({ 
          message: 'Invalid stream from Semester 1' 
        });
      }
      
      let availableDepartments = [];
      if (streamConfig.nextStep === 'final') {
        availableDepartments = streamConfig.departments;
      } else {
        // For sub-streams, return all possible departments
        Object.values(streamConfig.sub).forEach(departments => {
          availableDepartments.push(...departments);
        });
      }
      
      const invalidPreferences = preferences.filter(pref => 
        !availableDepartments.includes(pref)
      );

      if (invalidPreferences.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid preferences for your stream', 
          invalidPreferences,
          validChoices: availableDepartments
        });
      }
    }

    // Store preferences in priority order
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
