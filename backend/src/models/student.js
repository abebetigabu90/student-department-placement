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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  }],
  finalDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  entranceScore:     { type: Number, required: true },
  entranceMax:       { type: Number, required: true },    // 600 or 700
  semester1GPA:      { type: Number },                    // set after Sem 1
  semester2GPA:      { type: Number },                    // set after Sem 2
  bonusPoints:       { type: Number, default: 0 },        // computed automatically

  initialPreference: { type: String, required: true },    // stream or final-dept for Sem-1
  secondPreference:  { type: String },                    // sub-stream for Sem-2
  preferences:       [{ type: String }],                  // ordered list of final-dept choices for Sem-2
  finalDepartment:   { type: String },                    // convenience if only one dept

  placementStage: {
    type: String,
    enum: ['admitted','after-sem1','after-sem2','placed'],
    default: 'admitted'
  },
  assignedDepartment:{ type: String },
  totalScore:        { type: Number }
});

export default mongoose.model('Student', studentSchema);
