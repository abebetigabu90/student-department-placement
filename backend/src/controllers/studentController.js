import Student from '../models/Student.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Admin
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// @desc    Get student by studentId
// @route   GET /api/students/:studentId
// @access  Admin or student
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

// @desc    Create a new student
// @route   POST /api/students
// @access  Admin only
export const createStudent = async (req, res) => {
  try {
    // Optionally check if studentId already exists to avoid duplicates
    const existing = await Student.findOne({ studentId: req.body.studentId });
    if (existing) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }
    const student = new Student(req.body);
    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a student by studentId
// @route   PUT /api/students/:studentId
// @access  Admin only
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

// @desc    Delete a student by studentId
// @route   DELETE /api/students/:studentId
// @access  Admin only
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
