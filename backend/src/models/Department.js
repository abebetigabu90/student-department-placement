import mongoose from 'mongoose'
const departmentSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  capacity: { type: Number, required: true }
});

export default mongoose.model('Department', departmentSchema);