const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // <-- ADDED

const {
  getHero,
  createHero,
  updateHero,
  getAllHero,
  deleteHero,
} = require("../controllers/heroController");

// Test endpoint (guarded)
if (process.env.NODE_ENV !== 'production') {
  router.get("/test", (req, res) => {
    res.json({
      success: true,
      message: "Hero routes working",
      timestamp: new Date().toISOString()
    });
  });
}

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getHero);

/* =========================
   ADMIN ROUTES (PROTECTED)
========================= */
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get("/admin", getAllHero);
router.post("/", createHero);
router.put("/:id", updateHero);
router.delete("/:id", deleteHero);

module.exports = router;