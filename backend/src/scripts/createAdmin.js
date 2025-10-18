
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    createAdmin();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdmin() {
  try {
    const email = 'admin@dtu.edu.et';
    const password = '1111'; // Change in production
    const name = 'System Administrator';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await defaultAdmin.save();

    console.log('✅ Default admin created:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}
