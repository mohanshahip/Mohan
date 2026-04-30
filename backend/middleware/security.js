const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const logger = require("../utils/Logger");

const securityMiddleware = (app) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Helmet headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "blob:", "*"],
          connectSrc: ["'self'", "*"],
          frameAncestors: ["'none'"], // Prevent clickjacking
        },
      },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'same-origin' },
      xssFilter: true,
    })
  );

  // Prevent HTTP parameter pollution
  app.use(
    hpp({
      whitelist: ["sort", "page", "limit"],
    })
  );

  // CORS config
  const rawAllowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:5173", "http://localhost:5174"];
  // Clean origins (remove trailing slashes)
  const allowedOrigins = rawAllowedOrigins.map(url => url.replace(/\/$/, ""));

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Clean incoming origin for comparison
        const cleanOrigin = origin.replace(/\/$/, "");
        
        const isAllowed = allowedOrigins.includes(cleanOrigin) || 
                          cleanOrigin.includes('localhost') ||
                          cleanOrigin.includes('127.0.0.1');

        if (isAllowed) {
          return callback(null, true);
        } else {
          logger.warn(`🚫 CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(", ")}`);
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-device-id', 'Cache-Control', 'Pragma', 'Cookie'],
      exposedHeaders: ['set-cookie']
    })
  );

  logger.info("✅ Security middleware applied with enhanced protection");
};

module.exports = securityMiddleware;
