import mongoose from 'mongoose';
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
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
    type: String,
    default: 'None',
  },
  disabilityVerified: {
    type: Boolean,
    default: false,
  },
  preferences: [{
    type: String,  // Store department names in priority order (index 0 = Priority 1, index 1 = Priority 2, etc.)
  }],
  entranceMax:       { type: Number, required: true },    // 600 or 700
  semester1GPA:      { type: Number },                    // set after Sem 1
  semester2GPA:      { type: Number },                    // set after Sem 2
  cgpa:              { type: Number },                    // provided by university system

  placementStage: {
    type: String,
    enum: ['admitted','after-sem1','after-sem2','placed'],
    default: 'admitted'
  },
  assignedDepartment: { type: String },                   // final assigned department name
  totalScore:        { type: Number }
});

export default mongoose.model('Student', studentSchema);
