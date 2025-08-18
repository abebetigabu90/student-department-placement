import mongoose from 'mongoose'
const departmentSchema = new mongoose.Schema({
  deptID:{type:String},
  name:     { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  assigndedStudents:[{type:String}]
});

export default mongoose.model('Department', departmentSchema);