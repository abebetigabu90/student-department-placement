import express from 'express';
import { loginAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/protected', adminAuth, (req, res) => {
  res.json({ message: `Welcome ${req.admin.email}` });
});
export default router;
