// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

// Helper to normalize IP (handles IPv6 properly)
const getNormalizedIP = (req) => {
  const ip =
    req.ip ||
    req.connection?.remoteAddress ||
    req.headers["x-forwarded-for"] ||
    "unknown";

  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }

  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  return ip;
};

// Base factory
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;

  return rateLimit({
    windowMs,
    max: options.max || 100,
    message: {
      success: false,
      error: options.message || "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,

    keyGenerator: (req) => {
      const normalizedIP = getNormalizedIP(req);

      if (req.user?.id) {
        return `user:${req.user.id}:${normalizedIP}`;
      }

      return `ip:${normalizedIP}`;
    },

    // ✅ Use MongoDB store ONLY in production
    store:
      isProd && process.env.MONGO_URI
        ? new MongoStore({
            uri: process.env.MONGO_URI,
            collectionName: "rateLimits",
            expireTimeMs: windowMs,
          })
        : undefined,

    skip: (req) => req.path === "/health",

    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error:
          options.message || "Too many requests, please try again later",
        retryAfter: Math.ceil(windowMs / 1000 / 60),
      });
    },

    ...options,
  });
};

//////////////////////////////////////////////////////////
// AUTH LIMITER (Login)
//////////////////////////////////////////////////////////

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes

  // ✅ More attempts in development
  max: isDev ? 50 : 10,

  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true,

  keyGenerator: (req) => {
    const normalizedIP = getNormalizedIP(req);
    const email = req.body?.email?.toLowerCase() || "";
    return `auth:${email}:${normalizedIP}`;
  },
});

//////////////////////////////////////////////////////////
// FORGOT PASSWORD LIMITER
//////////////////////////////////////////////////////////

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour

  // ✅ More attempts in development
  max: isDev ? 20 : 5,

  message: "Too many password reset attempts. Please try again later.",

  keyGenerator: (req) => {
    const normalizedIP = getNormalizedIP(req);
    const email = req.body?.email?.toLowerCase() || "";
    return `forgot:${email}:${normalizedIP}`;
  },
});

//////////////////////////////////////////////////////////
// REFRESH TOKEN LIMITER (new)
//////////////////////////////////////////////////////////

const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 20,     // Higher limit than login, but still protected
  message: "Too many refresh attempts, please try again later",
  keyGenerator: (req) => {
    const deviceId = req.headers['x-device-id'] || 'unknown';
    const normalizedIP = getNormalizedIP(req);
    return `refresh:${deviceId}:${normalizedIP}`;
  },
});

//////////////////////////////////////////////////////////
// GENERAL API LIMITER
//////////////////////////////////////////////////////////

const apiLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 5000 : 1000,
  message: "API rate limit exceeded. Please slow down.",
});

//////////////////////////////////////////////////////////
// SENSITIVE OPERATIONS LIMITER
//////////////////////////////////////////////////////////

const sensitiveLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 20,
  message: "Too many sensitive operations. Please try again later.",
});

module.exports = {
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
  forgotPasswordLimiter,
  refreshLimiter,        // Export new limiter
  createRateLimiter,
};