import mongoose from 'mongoose';

const allowedRegions = [
  'Afar', 'Amhara', 'Tigray', 'Oromia', 'Gambela', 
  'Somali', 'SNNPR', 'Benishangul', 'Addis Ababa', 'Harari'
];

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  middleName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  region: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => allowedRegions.includes(v),
      message: props => `${props.value} is not a valid region.`,
    },
  },
  disabilityStatus: {
    type: Boolean,
    default: false,
  },
  GPA: {
    type: Number,
    required: true,
    min: 0,
    max: 4.0,
  },
  entranceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 700, // adjust if needed
  },
  departmentPreference: {
    type: [String],
    required: true,
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one department preference is required.',
    },
  },
  isPlaced: {
    type: Boolean,
    default: false,
  },
  placedDepartment: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
