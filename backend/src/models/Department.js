import mongoose from 'mongoose'
const departmentSchema = new mongoose.Schema({
  deptID:{type:String,unique:true,required:true},
  name:     { type: String, required: true, unique: true ,required:true},
  capacity: { type: Number, required: true },
  stream:{type:String,enum:['natural','social'],required:true},
  assigndedStudents:[{type:String}]
});

export default mongoose.model('Department', departmentSchema);