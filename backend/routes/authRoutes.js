// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { validateLogin,validateResetPassword, validateRegister} = require('../middleware/validators/authValidators');
const { authLimiter,forgotPasswordLimiter} = require('../middleware/rateLimiter');
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  updateProfile,
  updatePassword
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-email', verifyEmail);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordLimiter,forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.put('/reset-password/:token',validateResetPassword, resetPassword);

// Special case for /me to avoid 401 console error on initial load
router.get('/me', optionalAuth, getMe);

// Protected routes
router.use(protect); // All routes below require authentication
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.put('/update-profile', updateProfile);
router.put('/update-password', validateResetPassword, updatePassword); // reusing password validation logic

module.exports = router;