const Hero = require('../models/Hero');
const asyncHandler = require('express-async-handler');

// @desc    Get active hero content
// @route   GET /api/hero
// @access  Public
const getHero = asyncHandler(async (req, res) => {
  const { lang = 'en' } = req.query;
  
  const hero = await Hero.findOne({ 
    language: lang, 
    isActive: true 
  }).select('-__v');

  if (hero) {
    res.json({
      success: true,
      data: hero
    });
  } else {
    // Return default hero data if none found
    const defaultHero = {
      name: "Mohan Kattel",
      title: "Software Engineer & Tech Entrepreneur",
      description: "Building innovative digital solutions for Nepal's growing tech ecosystem. Passionate about creating technology that bridges gaps and empowers communities.",
      location: "Kathmandu, Nepal",
      organization: "Nepal Tech Foundation",
      yearsActive: "Since 2015",
      heroImage: {
        url: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        alt: "Professional portrait"
      },
      socialLinks: {
        linkedin: "#",
        twitter: "#",
        instagram: "#",
        contact: "/contact"
      },
      isDefault: true
    };
    
    res.json({
      success: true,
      data: defaultHero,
      isDefault: true
    });
  }
});

// @desc    Create hero content
// @route   POST /api/hero
// @access  Private/Admin
const createHero = asyncHandler(async (req, res) => {
  const { language = 'en' } = req.body;

  // Deactivate any existing active hero for this language
  await Hero.updateMany(
    { language, isActive: true },
    { isActive: false }
  );

  const formattedHero = {
    ...req.body,
    socialLinks: req.body.socialLinks || {
      linkedin: "#",
      twitter: "#",
      instagram: "#",
      contact: "/contact"
    },
    language,
    isActive: true,
    version: 1
  };

  const hero = await Hero.create(formattedHero);

  res.status(201).json({
    success: true,
    data: hero
  });
});

// @desc    Update hero content
// @route   PUT /api/hero/:id
// @access  Private/Admin
const updateHero = asyncHandler(async (req, res) => {
  let hero = await Hero.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      error: 'Hero content not found'
    });
  }

  // If making active, deactivate others
  if (req.body.isActive === true) {
    await Hero.updateMany(
      { 
        _id: { $ne: hero._id },
        language: hero.language,
        isActive: true 
      },
      { isActive: false }
    );
  }

  // Update social links if provided
  if (req.body.socialLinks) {
    req.body.socialLinks = {
      linkedin: req.body.socialLinks.linkedin || hero.socialLinks.linkedin,
      twitter: req.body.socialLinks.twitter || hero.socialLinks.twitter,
      instagram: req.body.socialLinks.instagram || hero.socialLinks.instagram,
      github: req.body.socialLinks.github || hero.socialLinks.github,
      contact: req.body.socialLinks.contact || hero.socialLinks.contact
    };
  }

  // Update metrics if provided
  if (req.body.metrics) {
    req.body.metrics = {
      projectsCompleted: req.body.metrics.projectsCompleted ?? hero.metrics?.projectsCompleted,
      yearsExperience: req.body.metrics.yearsExperience ?? hero.metrics?.yearsExperience,
      clientSatisfaction: req.body.metrics.clientSatisfaction ?? hero.metrics?.clientSatisfaction,
      globalReach: req.body.metrics.globalReach ?? hero.metrics?.globalReach
    };
  }

  hero = await Hero.findByIdAndUpdate(
    req.params.id,
    { 
      ...req.body,
      version: hero.version + 1 
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: hero
  });
});

// @desc    Get all hero content (for admin)
// @route   GET /api/hero/admin
// @access  Private/Admin
const getAllHero = asyncHandler(async (req, res) => {
  const heroes = await Hero.find().sort({ language: 1, createdAt: -1 });
  
  res.json({
    success: true,
    count: heroes.length,
    data: heroes
  });
});

// @desc    Delete hero content
// @route   DELETE /api/hero/:id
// @access  Private/Admin
const deleteHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    return res.status(404).json({
      success: false,
      error: 'Hero content not found'
    });
  }

  // If deleting active hero, activate the most recent one
  if (hero.isActive) {
    const latestHero = await Hero.findOne({
      _id: { $ne: hero._id },
      language: hero.language
    }).sort({ createdAt: -1 });

    if (latestHero) {
      latestHero.isActive = true;
      await latestHero.save();
    }
  }

  await hero.deleteOne();

  res.json({
    success: true,
    data: {}
  });
});

module.exports = {
  getHero,
  createHero,
  updateHero,
  getAllHero,
  deleteHero
};