const Gallery = require('../models/Gallery');
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const socketService = require('../services/socketService');

// Helper function to map frontend language codes to backend codes
const mapLanguageCode = (lang) => {
  if (lang === 'np') return 'ne';
  return lang;
};

// @desc    Get all published galleries (public)
// @route   GET /api/gallery
// @access  Public
const getGalleries = asyncHandler(async (req, res) => {
  const { lang, category } = req.query;
  
  let query = { isPublished: true };
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  
  const galleries = await Gallery.find(query)
    .sort({ date: -1, createdAt: -1 })
    .select('-__v');
  
  res.json({ 
    success: true, 
    count: galleries.length,
    data: galleries 
  });
});

// @desc    Get single gallery with view increment
// @route   GET /api/gallery/:id
// @access  Public
const getGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id).select('-__v');
  
  if (!gallery) {
    return res.status(404).json({ 
      success: false, 
      error: 'Gallery not found' 
    });
  }
  
  // Increment view count
  await gallery.incrementViews();
  
  res.json({ 
    success: true, 
    data: gallery 
  });
});

// @desc    Get popular galleries (most viewed)
// @route   GET /api/gallery/popular
// @access  Public
const getPopularGalleries = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = { isPublished: true };
  if (lang) query.language = mapLanguageCode(lang);
  
  const popular = await Gallery.find(query)
    .sort({ views: -1 })
    .limit(10)
    .select('title images category views likes date');
  
  res.json({ 
    success: true, 
    data: popular 
  });
});

// @desc    Get categories
// @route   GET /api/gallery/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = { isPublished: true };
  if (lang) query.language = mapLanguageCode(lang);
  
  const categories = await Gallery.aggregate([
    { $match: query },
    { $group: { 
      _id: '$category', 
      count: { $sum: 1 } 
    }},
    { $sort: { _id: 1 } }
  ]);
  
  res.json({ 
    success: true, 
    data: categories 
  });
});

// @desc    Get all galleries (admin) with pagination and search
// @route   GET /api/gallery/admin/all
// @access  Private (Admin)
const getAllGalleries = asyncHandler(async (req, res) => {
  const { lang, category, published, page, limit, search } = req.query;
  
  let query = {};
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  if (published !== undefined) query.isPublished = published === 'true';
  
  // Add search functionality
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { category: searchRegex }
    ];
  }
  
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;
  
  const galleries = await Gallery.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .select('-__v');
  
  const total = await Gallery.countDocuments(query);
  
  // Format image URLs
  const formattedGalleries = galleries.map(gallery => {
    const galleryData = gallery.toObject();
    if (galleryData.images && Array.isArray(galleryData.images)) {
      galleryData.images = galleryData.images.map(img => {
        if (img.url && !img.url.startsWith('http') && !img.url.startsWith('blob:')) {
          img.url = `${req.protocol}://${req.get('host')}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
        }
        return img;
      });
    }
    return galleryData;
  });
  
  res.json({ 
    success: true, 
    count: formattedGalleries.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: pageNumber,
    data: formattedGalleries 
  });
});

// @desc    Create gallery - SIMPLIFIED
// @route   POST /api/gallery
// @access  Private (Admin)
const createGallery = asyncHandler(async (req, res) => {
  const galleryData = {
    title: req.body.title,
    description: req.body.description || '',
    images: req.body.images || [],
    category: req.body.category || 'other',
    location: req.body.location || '',
    date: req.body.date || Date.now(),
    language: req.body.language || 'en',
    isPublished: req.body.isPublished !== false
  };
  
  // Map language code if coming from frontend
  if (galleryData.language === 'np') {
    galleryData.language = 'ne';
  }
  
  const gallery = await Gallery.create(galleryData);
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'CREATE_GALLERY',
      details: `Created new gallery: ${gallery.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'gallery',
      action: 'CREATE_GALLERY',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.status(201).json({ 
    success: true, 
    data: gallery 
  });
});

// @desc    Update gallery - SIMPLIFIED
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
const updateGallery = asyncHandler(async (req, res) => {
  let gallery = await Gallery.findById(req.params.id);
  
  if (!gallery) {
    return res.status(404).json({ 
      success: false, 
      error: 'Gallery not found' 
    });
  }
  
  // Only update allowed fields
  const allowedUpdates = ['title', 'description', 'category', 'location', 'date', 'language', 'isPublished'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      // Map language code if updating
      if (field === 'language' && req.body[field] === 'np') {
        gallery[field] = 'ne';
      } else {
        gallery[field] = req.body[field];
      }
    }
  });
  
  await gallery.save();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'UPDATE_GALLERY',
      details: `Updated gallery: ${gallery.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'gallery',
      action: 'UPDATE_GALLERY',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    data: gallery 
  });
});

// @desc    Delete gallery
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
const deleteGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  
  if (!gallery) {
    return res.status(404).json({ 
      success: false, 
      error: 'Gallery not found' 
    });
  }
  
  const galleryTitle = gallery.title;
  await gallery.deleteOne();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'DELETE_GALLERY',
      details: `Deleted gallery: ${galleryTitle}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'gallery',
      action: 'DELETE_GALLERY',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    message: 'Gallery deleted successfully' 
  });
});

// @desc    Like gallery
// @route   PATCH /api/gallery/:id/like
// @access  Public
const likeGallery = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  
  if (!gallery) {
    return res.status(404).json({ 
      success: false, 
      error: 'Gallery not found' 
    });
  }
  
  await gallery.incrementLikes();
  
  res.json({ 
    success: true, 
    data: { 
      likes: gallery.likes,
      message: 'Gallery liked'
    } 
  });
});

// @desc    Toggle publish status
// @route   PATCH /api/gallery/:id/toggle-publish
// @access  Private (Admin)
const togglePublish = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  
  if (!gallery) {
    return res.status(404).json({ 
      success: false, 
      error: 'Gallery not found' 
    });
  }
  
  gallery.isPublished = !gallery.isPublished;
  await gallery.save();
  
  res.json({ 
    success: true, 
    data: { 
      isPublished: gallery.isPublished,
      message: gallery.isPublished ? 'Gallery published' : 'Gallery unpublished'
    } 
  });
});

module.exports = {
  getGalleries,
  getGallery,
  getPopularGalleries,
  getCategories,
  getAllGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
  likeGallery,
  togglePublish
};