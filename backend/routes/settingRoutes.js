const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const {
  getSettings,
  updateSettings,
  generateApiKey,
  revokeApiKey,
  testNotification,
  exportSettings,
  importSettings,
  resetSettings
} = require("../controllers/SettingController");

const { protect, authorize } = require("../middleware/auth");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }
  next();
};

// Update settings validation
const updateSettingsValidation = [
  body("profile").optional().isObject(),
  body("security").optional().isObject(),
  body("notifications").optional().isObject(),
  body("appearance").optional().isObject(),
  body("api").optional().isObject(),
  body("backup").optional().isObject(),
  body("privacy").optional().isObject()
];

// API key validation
const apiKeyValidation = [
  body("name").notEmpty().withMessage("API key name is required"),
  body("permissions").optional().isArray()
];

// All routes require authentication
router.use(protect);

// Routes
router.get("/", authorize("admin", "superadmin"), getSettings);

router.put(
  "/",
  authorize("admin", "superadmin"),
  updateSettingsValidation,
  validate,
  updateSettings
);

router.post(
  "/api-keys",
  authorize("superadmin"),
  apiKeyValidation,
  validate,
  generateApiKey
);

router.delete(
  "/api-keys/:keyId",
  authorize("superadmin"),
  revokeApiKey
);

router.post(
  "/test-notification",
  authorize("admin"),
  testNotification
);

router.get(
  "/export",
  authorize("admin"),
  exportSettings
);

router.post(
  "/import",
  authorize("superadmin"),
  importSettings
);

router.post(
  "/reset",
  authorize("superadmin"),
  resetSettings
);

module.exports = router;