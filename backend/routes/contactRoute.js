const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ContactMessage, ContactInfo } = require("../models/Contact");
const { protect, authorize } = require("../middleware/auth");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/contact";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// ==================== PUBLIC ROUTES ====================
// Get contact information (public)
router.get("/info", async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      // Create default contact info if none exists
      contactInfo = await ContactInfo.create({
        email: "hello@mohankattel.com",
        phone: "+977 980-123-4567",
        address: "Kathmandu, Nepal",
        socialLinks: {
          facebook: "https://facebook.com/mohankattel",
          twitter: "https://twitter.com/mohankattel",
          linkedin: "https://linkedin.com/in/mohankattel",
          instagram: "https://instagram.com/mohankattel",
          github: "https://github.com/mohankattel"
        }
      });
    }
    
    // Transform the data for frontend
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let profileImageUrl = null;
    
    if (contactInfo.profileImage && contactInfo.profileImage.url) {
      if (contactInfo.profileImage.url.startsWith('http')) {
        profileImageUrl = contactInfo.profileImage.url;
      } else {
        const imagePath = contactInfo.profileImage.url.startsWith('/') 
          ? contactInfo.profileImage.url 
          : `/${contactInfo.profileImage.url}`;
        profileImageUrl = `${baseUrl}${imagePath}`;
      }
    }
    
    const responseData = {
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      workingHours: contactInfo.workingHours,
      faq: contactInfo.faq,
      availability: contactInfo.availability,
      profileImage: profileImageUrl,
      socialLinks: contactInfo.socialLinks
    };
    
    res.json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create message (public API)
router.post("/messages", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, subject, and message are required"
      });
    }
    
    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    await newMessage.save();
    
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================
// All admin routes require authentication
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Update contact information with image upload
router.put("/info", upload.single("profileImage"), async (req, res) => {
  try {
    const updatedInfo = req.body;
    const socialLinks = JSON.parse(updatedInfo.socialLinks || "{}");
    const faq = JSON.parse(updatedInfo.faq || "[]");
    const availability = JSON.parse(updatedInfo.availability || "{}");
    
    let contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo) {
      return res.status(400).json({ 
        success: false, 
        error: "Contact information not found. Please initialize it first." 
      });
    }
    
    contactInfo.email = updatedInfo.email;
    contactInfo.phone = updatedInfo.phone;
    contactInfo.address = updatedInfo.address;
    contactInfo.workingHours = updatedInfo.workingHours;
    contactInfo.socialLinks = socialLinks;
    contactInfo.faq = faq;
    contactInfo.availability = availability;
    
    if (req.file) {
      if (contactInfo.profileImage && contactInfo.profileImage.url) {
        const oldImagePath = contactInfo.profileImage.url.replace(/^\/uploads/, "uploads");
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      const relativePath = `/uploads/contact/${req.file.filename}`;
      contactInfo.profileImage = {
        url: relativePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }
    
    await contactInfo.save();
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImageFullUrl = contactInfo.profileImage ? 
      `${baseUrl}${contactInfo.profileImage.url}` : 
      null;
    
    res.json({
      success: true,
      message: "Contact information updated successfully",
      data: {
        ...contactInfo.toObject(),
        profileImage: profileImageFullUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete profile image
router.delete("/info/image", async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findOne();
    
    if (!contactInfo || !contactInfo.profileImage) {
      return res.status(404).json({ 
        success: false, 
        error: "No image found to delete" 
      });
    }
    
    const imagePath = contactInfo.profileImage.url.replace(/^\/uploads/, "uploads");
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    contactInfo.profileImage = undefined;
    await contactInfo.save();
    
    res.json({
      success: true,
      message: "Profile image deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages (admin only)
router.get("/messages", async (req, res) => {
  try {
    const { page = 1, limit = 10, read, replied, search } = req.query;
    
    let query = {};
    if (read !== undefined) query.read = read === 'true';
    if (replied !== undefined) query.replied = replied === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await ContactMessage.countDocuments(query);
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single message (admin only)
router.get("/messages/:id", async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// [Optional] Add PUT/PATCH/DELETE for messages as needed – all protected by the middleware above

// Remove POST route for creating contact info - only allow updates
router.post("/info", (req, res) => {
  res.status(405).json({
    success: false,
    error: "Method not allowed. Use PUT to update existing contact information."
  });
});

module.exports = router;