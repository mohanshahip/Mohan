// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAdmin,
  getAllAdmins,
  removeAdmin,
  toggleAdminStatus,
  getAdminById,
  updateAdmin,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Validation for creating admin
const createAdminValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// All routes require authentication
router.use(protect);

// Dashboard stats - available to both admin and superadmin
router.get('/dashboard-stats', authorize('admin', 'superadmin'), getDashboardStats);

// Admin management routes - superadmin only
router.use(authorize('superadmin'));
router.post('/create-admin', createAdminValidation, createAdmin);
router.get('/all-admins', getAllAdmins);
router.get('/admin/:id', getAdminById);
router.put('/update-admin/:id', updateAdmin);
router.delete('/remove-admin/:id', removeAdmin);
router.put('/toggle-status/:id', toggleAdminStatus);

module.exports = router;