
// file: projectUploadController.js
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/Logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/projects/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create upload middleware instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
  }
});

// @desc    Upload project images
// @route   POST /api/uploads/projects
// @access  Private (Admin)
const uploadProjectImages = asyncHandler(async (req, res) => {
  try {
    // Use the upload middleware directly
    const uploadMiddleware = upload.array('images', 10);
    
    uploadMiddleware(req, res, function (err) {
      if (err) {
        logger.error(`Upload error: ${err.message}`);
        return res.status(400).json({
          success: false,
          error: err.message || 'Upload failed'
        });
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      logger.info(`Uploaded ${files.length} files: ${files.map(f => f.filename).join(', ')}`);

      // Return URLs that can be accessed from the frontend
      const imageUrls = files.map(file => ({
        url: `/uploads/projects/${file.filename}`,
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        count: imageUrls.length,
        data: imageUrls
      });
    });
  } catch (error) {
    logger.error(`Controller error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error during upload'
    });
  }
});

module.exports = { uploadProjectImages };
