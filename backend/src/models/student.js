// models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  entranceScore: {
    type: Number,
    required: true,
  },
  gpa: {
    type: Number,
    required: true,
  },
  disability: {
    type: String, // Example: 'Visual', 'Hearing', 'None'
    default: 'None',
  },
  disabilityVerified: {
    type: Boolean,
    default: false,
  },
  preferences: [
    {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
      },
      rank: {
        type: Number,
        required: true,
      },
    },
  ],
  finalDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
