const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth"); // <-- ADDED

const {
  getSkills,
  getSkill,
  getSkillStats,
  getCategories,
  getSkillsByProficiency,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSkillOrder,
  toggleFeatured,
  updateSkillMetrics
} = require("../controllers/skillController");

// Test route (guarded)
if (process.env.NODE_ENV !== 'production') {
  router.get("/test", (req, res) => {
    res.json({ success: true, message: "Skill routes working" });
  });
}

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getSkills);
router.get("/stats", getSkillStats);
router.get("/categories", getCategories);
router.get("/by-proficiency", getSkillsByProficiency);
router.get("/:slug", getSkill);

/* =========================
   ADMIN ROUTES (PROTECTED)
========================= */
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get("/admin/all", getAllSkills);
router.post("/", createSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);
router.patch("/update-order", updateSkillOrder);
router.patch("/:id/toggle-featured", toggleFeatured);
router.patch("/:id/update-metrics", updateSkillMetrics);

module.exports = router;