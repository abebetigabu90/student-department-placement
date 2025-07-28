import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  quota: {
    type: Number,
    required: true,
  },
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
