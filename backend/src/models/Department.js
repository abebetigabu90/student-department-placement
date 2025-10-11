import mongoose from 'mongoose'
const departmentSchema = new mongoose.Schema({
  deptID:{type:String,unique:true,required:true},
  name:     { type: String, unique: true ,required:true},
  capacity: { type: Number, required: true },
  stream:{type:String,enum:['natural','social'],required:true},
  PrefTimeCategory:{type:String,enum:['FirstSem','SecSemFirst','SecSemSec'],required:true},
  PrefTypeCategory:{type:String,enum:['PreEngineering','OtherNatural','OtherSocial','Unique']},
  isFinalPref:{type:Boolean,required:true},
  totalAssignedStudents:{type:Number,default:0}
});

export default mongoose.model('Department', departmentSchema,'Department');