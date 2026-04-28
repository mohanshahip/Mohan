// controllers/uploadController.js
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/Logger");

/* =========================
   UTILS
========================= */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/* =========================
   STORAGE CONFIG
========================= */
const galleryStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dirPath = "uploads/gallery";
    ensureDirectoryExists(dirPath);
    cb(null, dirPath);
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `gallery-${unique}${path.extname(file.originalname)}`);
  }
});

const poemStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dirPath = "uploads/poems";
    ensureDirectoryExists(dirPath);
    cb(null, dirPath);
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `poem-${unique}${path.extname(file.originalname)}`);
  }
});

/* =========================
   FILE FILTER
========================= */
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid =
    allowed.test(file.mimetype) &&
    allowed.test(path.extname(file.originalname).toLowerCase());

  if (isValid) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

/* =========================
   MULTER INSTANCES
========================= */
const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

const poemUpload = multer({
  storage: poemStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
});

/* =========================
   CONTROLLERS
========================= */

// POST /api/upload/gallery
const uploadGalleryImage = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }

  const uploaded = req.files.map(file => ({
    url: `/uploads/gallery/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size
  }));

  res.status(200).json({
    success: true,
    data: uploaded   // now an array
  });
});
// In uploadController.js - uploadPoemImage function
const uploadPoemImage = asyncHandler(async (req, res) => {
  logger.info("Upload request received: " + JSON.stringify({
    file: req.file,
    body: req.body,
    files: req.files
  }));
  
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(400).json({ success: false, error: "No image uploaded" });
  }

  // Log file details
  console.log("File uploaded:", {
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    destination: req.file.destination
  });

  // Verify file exists on disk
  const fs = require('fs');
  const fileExists = fs.existsSync(req.file.path);
  console.log("File exists on disk:", fileExists, "at path:", req.file.path);

  res.json({
    success: true,
    data: {
      url: `/uploads/poems/${req.file.filename}`, // This is the key - relative URL
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});
// GET /api/upload/images
const getUploadedImages = asyncHandler(async (req, res) => {
  const { type = "poems" } = req.query;
  const dirPath = `uploads/${type}`;

  if (!fs.existsSync(dirPath)) {
    return res.json({ success: true, data: [] });
  }

  const files = fs.readdirSync(dirPath);
  const images = files
    .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .map(f => ({
      filename: f,
      url: `/uploads/${type}/${f}`
    }));

  res.json({ success: true, data: images });
});

// DELETE /api/upload/image
const deleteImage = asyncHandler(async (req, res) => {
  const { filename, type = "poems" } = req.query;

  if (!filename) {
    return res.status(400).json({ success: false, error: "Filename required" });
  }

  const filePath = path.join("uploads", type, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "Image not found" });
  }

  fs.unlinkSync(filePath);

  res.json({ success: true, message: "Image deleted successfully" });
});

/* =========================
   EXPORTS
========================= */
module.exports = {
  galleryUpload,
  poemUpload,
  uploadGalleryImage,
  uploadPoemImage,
  getUploadedImages,
  deleteImage
};
