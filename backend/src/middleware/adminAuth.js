// File: backend/src/middleware/adminAuth.js

import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = await Admin.findById(decoded.adminId).select('-password');

    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized: Admin not found' });
    }

    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default adminAuth;
