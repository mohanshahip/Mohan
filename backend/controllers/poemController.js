// controllers/poemController.js
const Poem = require('../models/Poem');
const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');
const socketService = require('../services/socketService');

// Helper function to map language codes
const mapLanguageCode = (lang) => {
  if (lang === 'np') return 'ne';
  return lang;
};

// @desc    Get all published poems
// @route   GET /api/poems
// @access  Public
// @desc    Get all published poems
// @route   GET /api/poems
// @access  Public
const getPoems = asyncHandler(async (req, res) => {
  const { lang, category, tag, featured, limit, page } = req.query;
  
  let query = { isPublished: true };
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;
  if (tag) query.tags = { $in: [tag] };
  
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;
  
  const poems = await Poem.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .select('-content -__v');
  
  const total = await Poem.countDocuments(query);
  
  // Format image URLs for all poems
  const formattedPoems = poems.map(poem => {
    const poemData = poem.toObject();
    
    // Handle images (new schema)
    if (poemData.images && poemData.images.length > 0) {
      poemData.images.forEach(image => {
        if (image.url && !image.url.startsWith('http') && !image.url.startsWith('blob:')) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          image.url = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
        }
      });
    }
    
    // Handle featuredImage (old schema)
    if (poemData.featuredImage?.url && !poemData.featuredImage.url.startsWith('http') && !poemData.featuredImage.url.startsWith('blob:')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      poemData.featuredImage.url = `${baseUrl}${poemData.featuredImage.url.startsWith('/') ? '' : '/'}${poemData.featuredImage.url}`;
    }
    
    return poemData;
  });
  
  res.json({ 
    success: true, 
    count: formattedPoems.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: pageNumber,
    data: formattedPoems 
  });
});


// @desc    Get single poem with view increment
// @route   GET /api/poems/:id
// @access  Public
// @desc    Get single poem with view increment
// @route   GET /api/poems/:id
// @access  Public
const getPoem = asyncHandler(async (req, res) => {
  const { admin } = req.query;
  
  // Don't check isPublished if admin is requesting
  let query = { _id: req.params.id };
  if (!admin || admin !== 'true') {
    query.isPublished = true;
  }
  
  const poem = await Poem.findById(req.params.id).select('-__v');
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  // Increment view count only for non-admin requests
  if (!admin || admin !== 'true') {
    await poem.incrementViews();
  }
  
  // Format image URL if it exists
  const poemData = poem.toObject();
  
  // Handle images (new schema)
  if (poemData.images && poemData.images.length > 0) {
    poemData.images.forEach(image => {
      if (image.url && !image.url.startsWith('http') && !image.url.startsWith('blob:')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        image.url = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
      }
    });
  }
  
  // Handle featuredImage (old schema)
  if (poemData.featuredImage?.url && !poemData.featuredImage.url.startsWith('http') && !poemData.featuredImage.url.startsWith('blob:')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    poemData.featuredImage.url = `${baseUrl}${poemData.featuredImage.url.startsWith('/') ? '' : '/'}${poemData.featuredImage.url}`;
  }
  
  res.json({ 
    success: true, 
    data: poemData 
  });
});

// @desc    Get categories with counts
// @route   GET /api/poems/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = { isPublished: true };
  if (lang) query.language = mapLanguageCode(lang);
  
  // Get counts for each category
  const categoryCounts = await Poem.aggregate([
    { $match: query },
    { $group: { 
      _id: '$category', 
      count: { $sum: 1 } 
    }}
  ]);
  
  // Define all available categories
  const allCategories = [
    { id: "love", name: "Love" },
    { id: "nature", name: "Nature" },
    { id: "inspirational", name: "Inspirational" },
    { id: "philosophical", name: "Philosophical" },
    { id: "nostalgic", name: "Nostalgic" },
    { id: "spiritual", name: "Spiritual" },
    { id: "social", name: "Social" },
    { id: "humorous", name: "Humorous" },
    { id: "other", name: "Other" }
  ];
  
  // Map counts to categories
  const categoriesWithCounts = allCategories.map(cat => {
    const found = categoryCounts.find(c => c._id === cat.id);
    return {
      ...cat,
      count: found ? found.count : 0
    };
  });
  
  res.json({ 
    success: true, 
    data: categoriesWithCounts 
  });
});

// @desc    Get featured poems
// @route   GET /api/poems/featured
// @access  Public
// @desc    Get featured poems
// @route   GET /api/poems/featured
// @access  Public
const getFeaturedPoems = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = { isPublished: true, isFeatured: true };
  if (lang) query.language = mapLanguageCode(lang);
  
  const featured = await Poem.find(query)
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title excerpt author category tags featuredImage images readingTime views likes');
  
  // Format image URLs
  const formattedFeatured = featured.map(poem => {
    const poemData = poem.toObject();
    
    // Handle images (new schema)
    if (poemData.images && poemData.images.length > 0) {
      poemData.images.forEach(image => {
        if (image.url && !image.url.startsWith('http') && !image.url.startsWith('blob:')) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          image.url = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
        }
      });
    }
    
    // Handle featuredImage (old schema)
    if (poemData.featuredImage?.url && !poemData.featuredImage.url.startsWith('http') && !poemData.featuredImage.url.startsWith('blob:')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      poemData.featuredImage.url = `${baseUrl}${poemData.featuredImage.url.startsWith('/') ? '' : '/'}${poemData.featuredImage.url}`;
    }
    
    return poemData;
  });
  
  res.json({ 
    success: true, 
    data: formattedFeatured 
  });
});

// @desc    Get poem statistics
// @route   GET /api/poems/stats
// @access  Public
const getPoemStats = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  
  let query = { isPublished: true };
  if (lang) query.language = mapLanguageCode(lang);
  
  const stats = await Poem.aggregate([
    { $match: query },
    { 
      $group: {
        _id: null,
        totalPoems: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        featured: { 
          $sum: { $cond: ['$isFeatured', 1, 0] }
        },
        avgReadingTime: { $avg: '$readingTime' }
      }
    }
  ]);
  
  // Get categories count
  const categories = await Poem.aggregate([
    { $match: query },
    { $group: { 
      _id: '$category', 
      count: { $sum: 1 } 
    }},
    { $sort: { count: -1 } }
  ]);
  
  // Get tags count
  const tags = await Poem.aggregate([
    { $match: query },
    { $unwind: '$tags' },
    { $group: { 
      _id: '$tags', 
      count: { $sum: 1 } 
    }},
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  res.json({ 
    success: true, 
    data: {
      ...stats[0] || {},
      categories,
      popularTags: tags
    }
  });
});

// @desc    Get all poems (admin)
// @route   GET /api/poems/admin/all
// @access  Private (Admin)
// @desc    Get all poems (admin)
// @route   GET /api/poems/admin/all
// @access  Private (Admin)
const getAllPoems = asyncHandler(async (req, res) => {
  const { lang, category, published, page, limit, search } = req.query;
  
  let query = {};
  
  if (lang) query.language = mapLanguageCode(lang);
  if (category) query.category = category;
  if (published !== undefined) query.isPublished = published === 'true';
  
  // Add search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  
  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * pageSize;
  
  const poems = await Poem.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .select('title category author language isPublished isFeatured views likes readingTime createdAt images featuredImage');
  
  const total = await Poem.countDocuments(query);
  
  // Format image URLs
  const formattedPoems = poems.map(poem => {
    const poemData = poem.toObject();
    
    // Handle images (new schema)
    if (poemData.images && poemData.images.length > 0) {
      poemData.images.forEach(image => {
        if (image.url && !image.url.startsWith('http') && !image.url.startsWith('blob:')) {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          image.url = `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
        }
      });
    }
    
    // Handle featuredImage (old schema)
    if (poemData.featuredImage?.url && !poemData.featuredImage.url.startsWith('http') && !poemData.featuredImage.url.startsWith('blob:')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      poemData.featuredImage.url = `${baseUrl}${poemData.featuredImage.url.startsWith('/') ? '' : '/'}${poemData.featuredImage.url}`;
    }
    
    return poemData;
  });
  
  res.json({ 
    success: true, 
    count: formattedPoems.length,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: pageNumber,
    data: formattedPoems 
  });
});
// @desc    Create poem
// @route   POST /api/poems
// @access  Private (Admin)
// @desc    Create poem
// @route   POST /api/poems
// @access  Private (Admin)
const createPoem = asyncHandler(async (req, res) => {
  const poemData = {
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt || req.body.content.substring(0, 200) + '...',
    author: req.body.author || 'Mohan Kattel',
    language: req.body.language || 'en',
    category: req.body.category || 'other',
    tags: req.body.tags || [],
    isPublished: req.body.isPublished !== false,
    isFeatured: req.body.isFeatured || false,
    readingTime: req.body.readingTime || 2
  };
  
  // Handle images
  if (req.body.images) {
    poemData.images = req.body.images.map(img => ({
      url: img.url,
      alt: img.alt || '',
      isPrimary: img.isPrimary || false
    }));
  }
  
  // Map language code if coming from frontend
  if (poemData.language === 'np') {
    poemData.language = 'ne';
  }
  
  const poem = await Poem.create(poemData);
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'CREATE_POEM',
      details: `Created new poem: ${poem.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'poem',
      action: 'CREATE_POEM',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.status(201).json({ 
    success: true, 
    data: poem 
  });
});

// @desc    Update poem
// @route   PUT /api/poems/:id
// @access  Private (Admin)
const updatePoem = asyncHandler(async (req, res) => {
  let poem = await Poem.findById(req.params.id);
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  // Update allowed fields
  const allowedUpdates = [
    'title', 'content', 'excerpt', 'author',
    'category', 'tags', 'language', 'images',
    'isPublished', 'isFeatured', 'readingTime'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      // Handle language mapping
      if (field === 'language' && req.body[field] === 'np') {
        poem[field] = 'ne';
      } else {
        poem[field] = req.body[field];
      }
    }
  });

  // Ensure there's always a primary image if images exist
  if (poem.images && poem.images.length > 0 && !poem.images.some(img => img.isPrimary)) {
    poem.images[0].isPrimary = true;
  }
  
  await poem.save();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'UPDATE_POEM',
      details: `Updated poem: ${poem.title}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'poem',
      action: 'UPDATE_POEM',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    data: poem 
  });
});


// @desc    Delete poem
// @route   DELETE /api/poems/:id
// @access  Private (Admin)
const deletePoem = asyncHandler(async (req, res) => {
  const poem = await Poem.findById(req.params.id);
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  const poemTitle = poem.title;
  await poem.deleteOne();
  
  // Log activity
  try {
    const activity = await ActivityLog.create({
      user: req.user?.id,
      action: 'DELETE_POEM',
      details: `Deleted poem: ${poemTitle}`
    });

    // Notify via socket
    socketService.notifyNewActivity({
      id: activity._id,
      type: 'poem',
      action: 'DELETE_POEM',
      details: activity.details,
      user: req.user?.username || 'Admin',
      timestamp: activity.createdAt
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
  
  res.json({ 
    success: true, 
    message: 'Poem deleted successfully' 
  });
});

// @desc    Like poem
// @route   PATCH /api/poems/:id/like
// @access  Public
const likePoem = asyncHandler(async (req, res) => {
  const poem = await Poem.findById(req.params.id);
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  await poem.incrementLikes();
  
  res.json({ 
    success: true, 
    data: { 
      likes: poem.likes,
      message: 'Poem liked'
    } 
  });
});

// @desc    Search poems
// @route   GET /api/poems/search
// @access  Public
// @desc    Search poems
// @route   GET /api/poems/search
// @access  Public
const searchPoems = asyncHandler(async (req, res) => {
  const { q, lang } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    });
  }
  
  let query = { 
    isPublished: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { excerpt: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ]
  };
  
  if (lang) query.language = mapLanguageCode(lang);
  
  const poems = await Poem.find(query)
    .sort({ createdAt: -1 })
    .select('title excerpt author category tags featuredImage readingTime views likes');
  
  // Format image URLs
  const formattedPoems = poems.map(poem => {
    const poemData = poem.toObject();
    if (poemData.featuredImage?.url && !poemData.featuredImage.url.startsWith('http')) {
      poemData.featuredImage.url = `${req.protocol}://${req.get('host')}${poemData.featuredImage.url}`;
    }
    return poemData;
  });
  
  res.json({ 
    success: true, 
    count: formattedPoems.length,
    data: formattedPoems 
  });
});


// @desc    Toggle publish status
// @route   PATCH /api/poems/:id/toggle-publish
// @access  Private (Admin)
const togglePublish = asyncHandler(async (req, res) => {
  const poem = await Poem.findById(req.params.id);
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  poem.isPublished = !poem.isPublished;
  await poem.save();
  
  res.json({ 
    success: true, 
    data: {
      isPublished: poem.isPublished,
      message: poem.isPublished ? 'Poem published' : 'Poem unpublished'
    }
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/poems/:id/toggle-featured
// @access  Private (Admin)
const toggleFeatured = asyncHandler(async (req, res) => {
  const poem = await Poem.findById(req.params.id);
  
  if (!poem) {
    return res.status(404).json({ 
      success: false, 
      error: 'Poem not found' 
    });
  }
  
  poem.isFeatured = !poem.isFeatured;
  await poem.save();
  
  res.json({ 
    success: true, 
    data: {
      isFeatured: poem.isFeatured,
      message: poem.isFeatured ? 'Poem featured' : 'Poem unfeatured'
    }
  });
});

module.exports = {
  getPoems,
  getPoem,
  getFeaturedPoems,
  getPoemStats,
  getCategories,
  getAllPoems,
  createPoem,
  updatePoem,
  deletePoem,
  likePoem,
  searchPoems,
  togglePublish,
  toggleFeatured
};