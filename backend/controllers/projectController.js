
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const socketService = require('../services/socketService');

/**
 * Always store language as:
 * en | ne
 */
const normalizeLanguage = (lang) => {
  if (lang === 'np') return 'ne';
  return lang;
};

/* =========================
   PUBLIC CONTROLLERS
========================= */

// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const { lang, category, status, featured } = req.query;

  const query = { isPublished: true };

  if (lang) query.language = normalizeLanguage(lang);
  if (category) query.category = category;
  if (status) query.status = status;
  if (featured === 'true') query.isFeatured = true;

  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .select('-__v -detailedDescription');

  res.json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// @desc    Get single project + increment views
// @route   GET /api/projects/:id
// @access  Public
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).select('-__v');

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Increment views only for public requests (not from admin panel)
  if (!req.query.admin) {
    await project.incrementViews();
  }

  res.json({ success: true, data: project });
});

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
const getFeaturedProjects = asyncHandler(async (req, res) => {
  const query = {
    isPublished: true,
    isFeatured: true,
  };

  if (req.query.lang) {
    query.language = normalizeLanguage(req.query.lang);
  }

  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .limit(6)
    .select(
      'title description images techStack category status liveUrl githubUrl'
    );

  res.json({ success: true, data: projects });
});

// @desc    Like project
// @route   PATCH /api/projects/:id/like
// @access  Public
const likeProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  await project.incrementLikes();

  res.json({
    success: true,
    data: { likes: project.likes },
  });
});

/* =========================
   ADMIN CONTROLLERS
========================= */

// @desc    Get all projects (admin with pagination & search)
// @route   GET /api/projects/admin/all
// @access  Private (Admin)
const getAllProjects = asyncHandler(async (req, res) => {
  const {
    lang,
    category,
    status,
    published,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (lang) query.language = normalizeLanguage(lang);
  if (category) query.category = category;
  if (status) query.status = status;
  if (published !== undefined)
    query.isPublished = published === 'true';

  // Enhanced search functionality
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { detailedDescription: searchRegex },
      { techStack: searchRegex },
      { client: searchRegex },
      { role: searchRegex },
      { category: searchRegex },
    ];
  }

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const total = await Project.countDocuments(query);

  const projects = await Project.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .select(
      'title category status description detailedDescription images techStack language isPublished isFeatured views likes client role startDate endDate createdAt updatedAt'
    );

  res.json({
    success: true,
    data: projects,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private (Admin)
const createProject = asyncHandler(async (req, res) => {
  const projectData = { ...req.body };
  
  if (projectData.language) projectData.language = normalizeLanguage(projectData.language);
  if (projectData.startDate === '') delete projectData.startDate;
  if (projectData.endDate === '') delete projectData.endDate;

  const project = await Project.create({
    ...projectData,
    language: projectData.language || 'en',
    isPublished: projectData.isPublished !== false,
    isFeatured: Boolean(projectData.isFeatured),
  });

  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'CREATE_PROJECT',
      details: `Created new project: ${project.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'project',
      action: 'CREATE_PROJECT',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }

  res.status(201).json({ success: true, data: project });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
const updateProject = asyncHandler(async (req, res) => {
  const projectData = { ...req.body };
  
  if (projectData.language) projectData.language = normalizeLanguage(projectData.language);
  if (projectData.startDate === '') delete projectData.startDate;
  if (projectData.endDate === '') delete projectData.endDate;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    projectData,
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'UPDATE_PROJECT',
      details: `Updated project: ${project.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'project',
      action: 'UPDATE_PROJECT',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }

  res.json({ success: true, data: project });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const projectTitle = project.title;
  await project.deleteOne();

  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'DELETE_PROJECT',
      details: `Deleted project: ${projectTitle}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'project',
      action: 'DELETE_PROJECT',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }

  res.json({ success: true, message: 'Project deleted successfully' });
});

// @desc    Toggle publish status
// @route   PATCH /api/projects/:id/toggle-publish
// @access  Private (Admin)
const togglePublish = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  project.isPublished = !project.isPublished;
  await project.save();

  res.json({
    success: true,
    data: { isPublished: project.isPublished },
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/projects/:id/toggle-featured
// @access  Private (Admin)
const toggleFeatured = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  project.isFeatured = !project.isFeatured;
  await project.save();

  res.json({
    success: true,
    data: { isFeatured: project.isFeatured },
  });
});

module.exports = {
  getProjects,
  getProject,
  getFeaturedProjects,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  togglePublish,
  toggleFeatured,
};
