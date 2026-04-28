const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  getFeaturedProjects,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  togglePublish,
  toggleFeatured
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/:id', getProject);
router.patch('/:id/like', likeProject);

// Protected admin routes
router.get('/admin/all', protect, authorize('admin', 'superadmin'), getAllProjects);
router.post('/', protect, authorize('admin', 'superadmin'), createProject);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateProject);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteProject);
router.patch('/:id/toggle-publish', protect, authorize('admin', 'superadmin'), togglePublish);
router.patch('/:id/toggle-featured', protect, authorize('admin', 'superadmin'), toggleFeatured);

module.exports = router;