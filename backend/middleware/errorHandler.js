// middleware/errorHandler.js
const logger = require('../utils/Logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    return res.status(400).json({
      success: false,
      error: message,
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  });
};

module.exports = { errorHandler };