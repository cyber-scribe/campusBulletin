const express = require('express');
const { 
  loginAdmin, 
  createAdmin, 
  getCurrentUser, 
  studentRegister, 
  studentLogin, 
  staffLogin,
  createStaff,
  updateProfile,
  changePassword,
  uploadAvatar,
  getUserById,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Admin routes
router.post('/admin/login', loginAdmin);
router.post('/admin/create', createAdmin); // Remove in production

// Staff routes
router.post('/staff/create', createStaff);
router.post('/staff/login', staffLogin);

// Student routes
router.post('/student/login', studentLogin);
router.post('/student/register', studentRegister);

// Common routes
router.get('/me', auth, getCurrentUser);
router.put('/me', auth, updateProfile);
router.put('/me/password', auth, changePassword);
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar);
router.get('/user/:id', auth, getUserById);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;

