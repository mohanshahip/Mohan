const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // <-- ADDED

const {
  galleryUpload,
  poemUpload,
  uploadGalleryImage,
  uploadPoemImage,
  getUploadedImages,
  deleteImage
} = require("../controllers/uploadController");

// All upload routes require authentication (admin only)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

/* =========================
   GALLERY IMAGE UPLOAD
========================= */
router.post(
  "/gallery",
  (req, res, next) => {
    galleryUpload.single("image")(req, res, err => {
      if (err) return res.status(400).json({ success: false, error: err.message });
      next();
    });
  },
  uploadGalleryImage
);

/* =========================
   POEM IMAGE UPLOAD
========================= */
router.post(
  "/image",
  (req, res, next) => {
    poemUpload.single("image")(req, res, err => {
      if (err) return res.status(400).json({ success: false, error: err.message });
      next();
    });
  },
  uploadPoemImage
);

/* =========================
   GET ALL UPLOADED IMAGES
========================= */
router.get("/images", getUploadedImages);

/* =========================
   DELETE IMAGE
========================= */
router.delete("/image", deleteImage);

module.exports = router;