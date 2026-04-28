const Skill = require('../models/Skill');
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const socketService = require('../services/socketService');

// Helper function to map language codes
const mapLanguageCode = (lang) => {
  if (lang === 'np') return 'ne';
  return lang;
};

// @desc    Get all skills (public)
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
  const { 
    lang, 
    category, 
    featured, 
    minProficiency,
    sort = 'displayOrder'
  } = req.query;
  
  let query = {};
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (minProficiency) query.proficiency = { $gte: parseInt(minProficiency) };
  
  let sortQuery = {};
  
  switch (sort) {
    case 'name':
      sortQuery = { name: 1 };
      break;
    case 'proficiency':
      sortQuery = { proficiency: -1 };
      break;
    case 'experience':
      sortQuery = { yearsOfExperience: -1 };
      break;
    case 'lastUsed':
      sortQuery = { lastUsed: -1 };
      break;
    default:
      sortQuery = { displayOrder: 1, proficiency: -1 };
  }
  
  const skills = await Skill.find(query)
    .sort(sortQuery)
    .select('-__v');
  
  res.json({ 
    success: true, 
    count: skills.length,
    data: skills 
  });
});

// @desc    Get all skills (admin) with pagination and search
// @route   GET /api/skills/admin/all
// @access  Private (Admin)
const getAllSkills = asyncHandler(async (req, res) => {
  const { 
    lang, 
    category, 
    featured, 
    search,
    page = 1,
    limit = 10
  } = req.query;
  
  let query = {};
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  if (featured !== undefined) query.isFeatured = featured === 'true';
  
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ];
  }
  
  const pageNumber = Math.max(parseInt(page), 1);
  const pageSize = Math.max(parseInt(limit), 1);
  const skip = (pageNumber - 1) * pageSize;
  
  const total = await Skill.countDocuments(query);
  
  const skills = await Skill.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .select('name slug category proficiency yearsOfExperience icon iconType iconClass color isFeatured displayOrder language metrics.projectsCount description');
  
  res.json({ 
    success: true, 
    count: skills.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: pageNumber,
    data: skills 
  });
});

// @desc    Create skill
// @route   POST /api/skills
// @access  Private (Admin)
const createSkill = asyncHandler(async (req, res) => {
  const skillData = {
    name: req.body.name,
    description: req.body.description || '',
    category: req.body.category || 'other',
    proficiency: req.body.proficiency || 50,
    yearsOfExperience: req.body.yearsOfExperience || 1,
    icon: req.body.icon || '💻',
    iconType: req.body.iconType || 'emoji',
    iconClass: req.body.iconClass || '',
    color: req.body.color || '#667eea',
    tags: req.body.tags || [],
    certifications: req.body.certifications || [],
    language: req.body.language || 'en',
    isFeatured: req.body.isFeatured || false,
    displayOrder: req.body.displayOrder || 0,
    lastUsed: req.body.lastUsed || Date.now(),
    metrics: {
      projectsCount: req.body.metrics?.projectsCount || 0,
      satisfaction: req.body.metrics?.satisfaction || 85,
      frequency: req.body.metrics?.frequency || 'weekly'
    },
    links: req.body.links || {}
  };
  
  // Map language code if coming from frontend
  if (skillData.language === 'np') {
    skillData.language = 'ne';
  }
  
  const skill = await Skill.create(skillData);
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'CREATE_SKILL',
      details: `Created new skill: ${skill.name}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'skill',
      action: 'CREATE_SKILL',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.status(201).json({ 
    success: true, 
    data: skill 
  });
});

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
const updateSkill = asyncHandler(async (req, res) => {
  let skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return res.status(404).json({ 
      success: false, 
      error: 'Skill not found' 
    });
  }
  
  // Update allowed fields
  const allowedUpdates = [
    'name', 'description', 'category', 'proficiency',
    'yearsOfExperience', 'icon', 'iconType', 'iconClass',
    'color', 'tags', 'certifications', 'language',
    'isFeatured', 'displayOrder', 'lastUsed', 'metrics', 'links'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'language' && req.body[field] === 'np') {
        skill[field] = 'ne';
      } else {
        skill[field] = req.body[field];
      }
    }
  });
  
  await skill.save();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'UPDATE_SKILL',
      details: `Updated skill: ${skill.name}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'skill',
      action: 'UPDATE_SKILL',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    data: skill 
  });
});

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return res.status(404).json({ 
      success: false, 
      error: 'Skill not found' 
    });
  }
  
  const skillName = skill.name;
  await skill.deleteOne();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'DELETE_SKILL',
      details: `Deleted skill: ${skillName}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'skill',
      action: 'DELETE_SKILL',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    message: 'Skill deleted successfully' 
  });
});

// @desc    Update skill order
// @route   PATCH /api/skills/update-order
// @access  Private (Admin)
const updateSkillOrder = asyncHandler(async (req, res) => {
  const { skills } = req.body; // Array of { id, displayOrder }
  
  if (!Array.isArray(skills)) {
    return res.status(400).json({
      success: false,
      error: 'Skills array is required'
    });
  }
  
  const bulkOps = skills.map(skill => ({
    updateOne: {
      filter: { _id: skill.id },
      update: { displayOrder: skill.displayOrder }
    }
  }));
  
  await Skill.bulkWrite(bulkOps);
  
  res.json({
    success: true,
    message: 'Skill order updated successfully'
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/skills/:id/toggle-featured
// @access  Private (Admin)
const toggleFeatured = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return res.status(404).json({ 
      success: false, 
      error: 'Skill not found' 
    });
  }
  
  skill.isFeatured = !skill.isFeatured;
  await skill.save();
  
  res.json({ 
    success: true, 
    data: { 
      isFeatured: skill.isFeatured,
      message: skill.isFeatured ? 'Skill featured' : 'Skill unfeatured'
    } 
  });
});

// @desc    Update skill metrics
// @route   PATCH /api/skills/:id/update-metrics
// @access  Private (Admin)
const updateSkillMetrics = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return res.status(404).json({ 
      success: false, 
      error: 'Skill not found' 
    });
  }
  
  if (req.body.projectsCount !== undefined) {
    skill.metrics.projectsCount = req.body.projectsCount;
  }
  
  if (req.body.satisfaction !== undefined) {
    skill.metrics.satisfaction = req.body.satisfaction;
  }
  
  if (req.body.frequency !== undefined) {
    skill.metrics.frequency = req.body.frequency;
  }
  
  await skill.save();
  
  res.json({
    success: true,
    data: skill.metrics
  });
});

// Add these other controller functions (simplified versions)
const getSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findOne({ slug: req.params.slug });
  
  if (!skill) {
    return res.status(404).json({ 
      success: false, 
      error: 'Skill not found' 
    });
  }
  
  res.json({ 
    success: true, 
    data: skill 
  });
});

const getSkillStats = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = {};
  if (lang) query.language = mapLanguageCode(lang);
  
  const stats = await Skill.aggregate([
    { $match: query },
    { 
      $group: {
        _id: null,
        totalSkills: { $sum: 1 },
        avgProficiency: { $avg: '$proficiency' },
        totalExperience: { $sum: '$yearsOfExperience' },
        featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } }
      }
    }
  ]);
  
  res.json({ 
    success: true, 
    data: stats[0] || {}
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = {};
  if (lang) query.language = mapLanguageCode(lang);
  
  const categories = await Skill.aggregate([
    { $match: query },
    { 
      $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        avgProficiency: { $avg: '$proficiency' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  res.json({ 
    success: true, 
    data: categories 
  });
});

const getSkillsByProficiency = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = {};
  if (lang) query.language = mapLanguageCode(lang);
  
  const skills = await Skill.find(query)
    .sort({ proficiency: -1 })
    .select('name category proficiency yearsOfExperience icon color');
  
  const grouped = {
    expert: skills.filter(s => s.proficiency >= 90),
    advanced: skills.filter(s => s.proficiency >= 70 && s.proficiency < 90),
    intermediate: skills.filter(s => s.proficiency >= 50 && s.proficiency < 70),
    beginner: skills.filter(s => s.proficiency < 50)
  };
  
  res.json({ 
    success: true, 
    data: grouped 
  });
});

module.exports = {
  getSkills,
  getSkill,
  getSkillStats,
  getCategories,
  getSkillsByProficiency,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSkillOrder,
  toggleFeatured,
  updateSkillMetrics
};