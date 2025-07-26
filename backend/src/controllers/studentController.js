// backend/src/controllers/studentController.js

import Student from '../models/student.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Admin
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students); // ✅ 200 OK
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching students' }); // ✅ 500 Internal Server Error
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Admin or student
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' }); // ✅ 404 Not Found
    }
    res.status(200).json(student); // ✅ 200 OK
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching student' }); // ✅ 500
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Admin
export const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    const createdStudent = await student.save();
    res.status(201).json(createdStudent); // ✅ 201 Created
  } catch (error) {
    res.status(400).json({ message: error.message }); // ✅ 400 Bad Request
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Admin
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' }); // ✅ 404
    }

    Object.assign(student, req.body);
    const updatedStudent = await student.save();
    res.status(200).json(updatedStudent); // ✅ 200 OK
  } catch (error) {
    res.status(400).json({ message: error.message }); // ✅ 400
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Admin
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' }); // ✅ 404
    }

    await student.deleteOne();
    res.status(200).json({ message: 'Student removed' }); // ✅ 200 OK
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting student' }); // ✅ 500
  }
};
