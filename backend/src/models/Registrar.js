import mongoose from 'mongoose';

const registrarSchema = new mongoose.Schema({
  name:{type:String},
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
});

const Registrar = mongoose.model('Registrar', registrarSchema);
export default Registrar;
