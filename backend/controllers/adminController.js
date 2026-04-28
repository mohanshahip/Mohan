// controllers/adminController.js - Enhanced version
const User = require('../models/User');
const Poem = require('../models/Poem');
const Project = require('../models/Project');
const Gallery = require('../models/Gallery');
const Skill = require('../models/Skill');
const socketService = require('../services/socketService');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');
const logger = require('../utils/Logger');

// @desc    Create new admin (superadmin only)
// @route   POST /api/admin/create-admin
// @access  Private/SuperAdmin
// controllers/adminController.js (excerpt of createAdmin)
const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: errors.array()[0].msg 
      });
    }

    let { username, email, password, firstName, lastName, role } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username, email, and password'
      });
    }

    // Check existing user (use normalized email)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Create admin with normalized email
    const admin = await User.create({
      username,
      email,
      password,
      role: role || 'admin',
      isVerified: true, // Superadmin-created accounts are verified by default
      isActive: true,
      createdBy: req.user.id,
      profile: { firstName: firstName || '', lastName: lastName || '' }
    });


    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'CREATE_ADMIN',
      details: `Created new admin: ${username}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Notify via socket
    socketService.notifyAdminCreation(admin);

    // Send welcome email (async, don't block response)
    const emailService = require('../utils/emailService');
    emailService.sendWelcomeEmail(admin.email, admin.username, password)
      .then(result => logger.info(`Welcome email sent to ${admin.email}`))
      .catch(err => logger.error(`Failed to send welcome email to ${admin.email}: ${err.message}`));

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        profile: admin.profile,
        createdAt: admin.createdAt,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    logger.error(`Create admin error: ${error.message}`);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages[0]
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create admin'
    });
  }
};

// @desc    Get all admins with pagination
// @route   GET /api/admin/all-admins
// @access  Private/SuperAdmin
const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: { $in: ['admin', 'moderator', 'superadmin'] } };
    
    // Add filters if provided
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    
    if (req.query.search) {
      query.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Add sorting
    let sortOption = '-createdAt';
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'oldest': sortOption = 'createdAt'; break;
        case 'name': sortOption = 'username'; break;
        case 'email': sortOption = 'email'; break;
        default: sortOption = '-createdAt';
      }
    }

    const [admins, total, activeCount, newThisMonth] = await Promise.all([
      User.find(query)
        .select('username email profile createdAt lastLogin isActive role createdBy')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      User.countDocuments({ ...query, isActive: true }),
      User.countDocuments({
        ...query,
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      })
    ]);

    // Get creator info for each admin
    const adminIds = admins.map(a => a.createdBy).filter(Boolean);
    const creators = await User.find({ _id: { $in: adminIds } })
      .select('username')
      .lean();

    const creatorMap = creators.reduce((map, creator) => {
      map[creator._id] = creator.username;
      return map;
    }, {});

    const adminsWithCreator = admins.map(admin => ({
      ...admin,
      createdByUsername: admin.createdBy ? creatorMap[admin.createdBy] : null
    }));

    res.json({
      success: true,
      count: admins.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      admins: adminsWithCreator,
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        newThisMonth
      }
    });

  } catch (error) {
    logger.error(`Get admins error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admins'
    });
  }
};

// @desc    Toggle admin status
// @route   PUT /api/admin/toggle-status/:id
// @access  Private/SuperAdmin
const toggleAdminStatus = async (req, res) => {
  try {
    // Validate ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid admin ID format'
      });
    }

    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: { $in: ['admin', 'moderator', 'superadmin'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // Don't allow deactivating yourself
    if (admin._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify your own account'
      });
    }

    admin.isActive = !admin.isActive;
    await admin.save({ validateBeforeSave: false });

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: admin.isActive ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN',
      details: `${admin.isActive ? 'Activated' : 'Deactivated'} admin: ${admin.username}`,
      targetUser: admin._id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // If deactivated, notify user in real-time
    if (!admin.isActive) {
      socketService.notifyUserDeactivation(admin._id);
    }

    res.json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: admin.isActive
    });

  } catch (error) {
    logger.error(`Toggle admin status error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle admin status'
    });
  }
};


// @desc    Get single admin by ID
// @route   GET /api/admin/:id
// @access  Private/SuperAdmin
const getAdminById = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: { $in: ['admin', 'moderator', 'superadmin'] }
    }).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin
    });

  } catch (error) {
    logger.error(`Get admin error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin'
    });
  }
};


// @desc    Remove admin
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
const removeAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: { $in: ['admin', 'moderator', 'superadmin'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    await admin.deleteOne();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'REMOVE_ADMIN',
      details: `Removed admin: ${admin.username}`,
      targetUser: admin._id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Admin removed successfully'
    });

  } catch (error) {
    logger.error(`Remove admin error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to remove admin'
    });
  }
};


// @desc    Update admin
// @route   PUT /api/admin/update-admin/:id
// @access  Private/SuperAdmin
const updateAdmin = async (req, res) => {
  try {
    const { firstName, lastName, role, email } = req.body;

    const admin = await User.findOne({ 
      _id: req.params.id, 
      role: { $in: ['admin', 'moderator', 'superadmin'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    // Check email uniqueness if changed
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    // Update fields
    if (firstName) admin.profile.firstName = firstName;
    if (lastName) admin.profile.lastName = lastName;
    if (email) admin.email = email;
    if (role && req.user.role === 'superadmin') admin.role = role;

    await admin.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'UPDATE_ADMIN',
      details: `Updated admin: ${admin.username}`,
      targetUser: admin._id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        profile: admin.profile
      }
    });

  } catch (error) {
    logger.error(`Update admin error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      poemCount,
      projectCount,
      galleryCount,
      skillCount,
      adminCount,
      recentActivity,
      poemStats,
      projectStats
    ] = await Promise.all([
      Poem.countDocuments(),
      Project.countDocuments(),
      Gallery.countDocuments(),
      Skill.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      ActivityLog.find()
        .populate('user', 'username profile')
        .sort('-createdAt')
        .limit(10)
        .lean(),
      Poem.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' }
          }
        }
      ]),
      Project.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' }
          }
        }
      ])
    ]);

    const stats = {
      counts: {
        poems: poemCount,
        projects: projectCount,
        gallery: galleryCount,
        skills: skillCount,
        admins: adminCount
      },
      engagement: {
        totalViews: (poemStats[0]?.totalViews || 0) + (projectStats[0]?.totalViews || 0),
        totalLikes: (poemStats[0]?.totalLikes || 0) + (projectStats[0]?.totalLikes || 0)
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        user: activity.user?.username || 'System',
        action: activity.action,
        details: activity.details,
        timestamp: activity.createdAt
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Dashboard stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  removeAdmin,
  toggleAdminStatus,
  getAdminById,
  updateAdmin,
  getDashboardStats
};