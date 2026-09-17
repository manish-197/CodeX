import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updateProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;
