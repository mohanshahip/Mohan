const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // <-- ADDED

const {
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
} = require("../controllers/galleryController");

const {
  galleryUpload,
  uploadGalleryImage
} = require("../controllers/uploadController");

// Test route (guarded for non-production)
if (process.env.NODE_ENV !== 'production') {
  router.get("/test", (req, res) => {
    res.json({ success: true, message: "Gallery routes working" });
  });
}

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getGalleries);
router.get("/popular", getPopularGalleries);
router.get("/categories", getCategories);
router.get("/:id", getGallery);
router.patch("/:id/like", likeGallery);

/* =========================
   ADMIN ROUTES (PROTECTED)
========================= */
// All admin routes require authentication
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get("/admin/all", getAllGalleries);
router.post("/", createGallery);
router.post("/upload", galleryUpload.array("image", 10), uploadGalleryImage);
router.put("/:id", updateGallery);
router.delete("/:id", deleteGallery);
router.patch("/:id/toggle-publish", togglePublish);

module.exports = router;