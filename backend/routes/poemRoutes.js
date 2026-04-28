const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // <-- ADDED

const {
  getPoems,
  getPoem,
  getFeaturedPoems,
  getPoemStats,
  getAllPoems,
  createPoem,
  updatePoem,
  deletePoem,
  likePoem,
  searchPoems,
  getCategories,
  togglePublish,
  toggleFeatured
} = require("../controllers/poemController");

// Test route (guarded)
if (process.env.NODE_ENV !== 'production') {
  router.get("/test", (req, res) => {
    res.json({ success: true, message: "Poem routes working" });
  });
}

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getPoems);
router.get("/featured", getFeaturedPoems);
router.get("/stats", getPoemStats);
router.get("/categories", getCategories);
router.get("/search", searchPoems);
router.get("/:id", getPoem);
router.patch("/:id/like", likePoem);

/* =========================
   ADMIN ROUTES (PROTECTED)
========================= */
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get("/admin/all", getAllPoems);
router.post("/", createPoem);
router.put("/:id", updatePoem);
router.delete("/:id", deletePoem);
router.patch("/:id/toggle-publish", togglePublish);
router.patch("/:id/toggle-featured", toggleFeatured);

module.exports = router;