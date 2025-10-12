import mongoose from 'mongoose';
const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    required: true,
    enum: ['Natural Science', 'Social Science']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  region: {
    type: String,
    required: true,
    // enum: [
    //   'Addis Ababa',
    //   'Afar',
    //   'Amhara',
    //   'Benishangul-Gumuz',
    //   'Dire Dawa',
    //   'Gambela',
    //   'Harari',
    //   'Oromia',
    //   'Sidama',
    //   'Somali',
    //   'Southern Nations, Nationalities, and Peoples\' Region (SNNPR)',
    //   'Tigray'
    // ]
  },
disability: {
  type: String,
  default: 'none',
},
  entranceScore: {
    type: Number,
    default:null
  },
  gpa: {
    type: Number,
    default: null
  },
  cgpa: { 
    type: Number, 
    default: null
  },
  Department: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department", 
    default: null 
  },
  totalScore: { 
    type: Number, 
    default: null
  },
  isAssigned: {
  type: Boolean,
  default:false
  },
  // isPreEngineering: {
  // type: Boolean,
  // default:false
  // },
  // isOtherNatural: {
  // type: Boolean,
  // default:false
  // },
  // isOtherSocial: {
  // type: Boolean,
  // default:false
  // }
},
 {
  timestamps: true
},
);
export default mongoose.model('Student', studentSchema, 'Student');


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