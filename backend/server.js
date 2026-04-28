/* =========================
   LOAD ENVIRONMENT VARIABLES
========================= */
require("dotenv").config();
const logger = require("./utils/Logger")

/* =========================
   VALIDATE ENV VARIABLES
========================= */
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "ENCRYPTION_KEY"
];
const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

/* =========================
   IMPORTS
========================= */
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

/* =========================
   ROUTES IMPORT
========================= */
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const heroRoutes = require("./routes/heroRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const projectRoutes = require("./routes/projectRoutes");
const skillRoutes = require("./routes/skillRoutes");
const poemRoutes = require("./routes/poemRoutes");
const contactRoutes = require("./routes/contactRoute");
const settingsRoutes = require("./routes/settingRoutes");

/* =========================
   UPLOAD CONTROLLERS
========================= */
const {
  galleryUpload,
  poemUpload,
  uploadGalleryImage,
  uploadPoemImage,
  getUploadedImages,
  deleteImage,
} = require("./controllers/uploadController");

const {
  uploadProjectImages,
} = require("./controllers/projectUploadController");

/* =========================
   MIDDLEWARES
========================= */
const compression = require("compression");
const securityMiddleware = require("./middleware/security");
const requestLogger = require("./middleware/requestLogger");
const { errorHandler } = require("./middleware/errorHandler");
const csrfProtection = require("./middleware/csrf");          // CSRF double‑submit
const auditLogger = require("./middleware/auditLogger");      // Audit logging
const noCache = require("./middleware/noCache");              // Prevent caching of sensitive data

/* Rate Limiters */
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

/* =========================
   DATABASE
========================= */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio";
    // Mask password in URI for logging
    const maskedUri = mongoUri.replace(/\/\/.*:.*@/, '//***:***@');
    
    const conn = await mongoose.connect(mongoUri);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📁 Database Name: ${conn.connection.name}`);
    logger.info(`🔗 Connection URI: ${maskedUri}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/* =========================
   BACKGROUND JOBS
========================= */
const { startTokenCleanup } = require("./jobs/tokenCleanup");

/* =========================
   SOCKET SERVICE
========================= */
const socketService = require("./services/socketService");

/* =========================
   APP INITIALIZATION
========================= */
const app = express();

// Use compression before other middleware
app.use(compression());

/* =========================
   CREATE SERVER + SOCKET.IO
========================= */
const server = http.createServer(app);

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

/* =========================
   INITIALIZE SERVICES
========================= */
socketService.initialize(io);

// Wait for database connection before starting jobs
const initializeApp = async () => {
  try {
    await connectDB();
    startTokenCleanup();
  } catch (err) {
    logger.error(`❌ App initialization failed: ${err.message}`);
    // We don't exit here if we want nodemon to stay alive or retry logic in connectDB
  }
};

initializeApp();

/* =========================
   GLOBAL MIDDLEWARES
========================= */
securityMiddleware(app);
app.use(noCache);                       // Prevent caching of all API responses
app.use(requestLogger);                 // Morgan logging (streamed to Winston)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CSRF protection (after cookie parser)
app.use(csrfProtection);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   RATE LIMITERS
========================= */
app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);

/* =========================
   ROUTES WITH AUDIT LOGGING
========================= */
// Auth routes – audit with action type 'AUTH_ACTION'
app.use("/api/auth", auditLogger('AUTH_ACTION'), authRoutes);

// Admin routes – audit with action type 'ADMIN_ACTION'
app.use("/api/admin/settings", settingsRoutes); // Move settings before general admin
app.use("/api/admin", auditLogger('ADMIN_ACTION'), adminRoutes);

/* =========================
   OTHER ROUTES (no audit needed)
========================= */
app.use("/api/hero", heroRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/poems", poemRoutes);
app.use("/api/contact", contactRoutes);

/* =========================
   UPLOAD ROUTES
========================= */
app.post("/api/projects/upload", uploadProjectImages);
app.post("/api/poems/upload", poemUpload.single("image"), uploadPoemImage);
app.get("/api/upload/images", getUploadedImages);
app.delete("/api/upload/image", deleteImage);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  logger.info(`Health check from ${req.ip}`);
  res.json({
    success: true,
    message: "🚀 Portfolio API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  logger.warn(`404 - ${req.method} ${req.originalUrl} - ${req.ip}`);
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on("SIGINT", async () => {
  logger.info("👋 SIGINT received. Shutting down...");
  server.close();
  await mongoose.connection.close();
  logger.info("Database connection closed. Exiting.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("👋 SIGTERM received. Shutting down...");
  server.close();
  await mongoose.connection.close();
  logger.info("Database connection closed. Exiting.");
  process.exit(0);
});

/* Export for testing */
module.exports = { app, server, io };