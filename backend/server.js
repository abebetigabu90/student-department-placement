// Project: Online Department Placement System (ODPS)
// Stack: MERN (MongoDB, Express.js, React.js, Node.js)

// === PROJECT SETUP ===
// This canvas will help us organize and build the full MERN project step by step.
// Each section will focus on a specific component or feature.

// === STEP 1: BACKEND SERVER SETUP (Express with ES Modules) ===
// File: backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
  }
};

startServer();
