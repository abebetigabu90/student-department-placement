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
  stream:{type:String,required:true},
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
  },
  disability: {
    type: String,
    default: 'None',
  },
  preferences: [{type: String,}],
  cgpa:{ type: Number },                    // provided by university system
  Department: { type: String, default: null },            
  totalScore:        { type: Number,default:0 }
});

export default mongoose.model('Student', studentSchema);


 // disabilityVerified: {
  //   type: Boolean,
  //   default: false,
  // },
 // placementStage: {
  //   type: String,
  //   enum: ['admitted','after-sem1','after-sem2','placed'],
  //   default: 'admitted'
  // },
  // semester1GPA:      { type: Number },                    // set after Sem 1
  // semester2GPA:      { type: Number }, 
  //   assignedStream: { type: String, default: null },
  // assignedSubStream: { type: String, default: null },
   // entranceMax:       { type: Number, default: 700},//{ type: Number, required: true },    // 600 or 700