// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/Logger');

// Protect routes - verify access token
const protect = async (req, res, next) => {
  try {
    let token;

    // DEBUG LOG
    logger.debug(`Auth protect check - Cookies: ${JSON.stringify(req.cookies)}, Headers Auth: ${!!req.headers.authorization}`);

    // Get token from cookie first (preferred), then from Authorization header
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn(`Auth protect failed: No token provided. Cookies: ${JSON.stringify(Object.keys(req.cookies || {}))}`);
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      logger.error(`JWT verification failed: ${err.message}`);
      throw err; // rethrow to be caught by the outer catch
    }

    // Check if it's an access token
    if (decoded.type !== 'access') {
      logger.warn(`Auth protect failed: Invalid token type ${decoded.type}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select('-refreshTokens');

    if (!user) {
      logger.warn(`Auth protect failed: User not found for ID ${decoded.id}`);
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // Check if user is active - use strict boolean check
    if (user.isActive === false) {
      logger.warn(`Auth protect failed: Account deactivated for ${user.email}`);
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Check if user is verified - use strict boolean check
    if (user.isVerified === false) {
      logger.warn(`Auth protect failed: Account not verified for ${user.email}`);
      return res.status(401).json({
        success: false,
        error: 'Account not verified'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: 'Password recently changed. Please login again.'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional auth - doesn't require authentication but attaches user if token exists
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      if (decoded.type === 'access') {
        const user = await User.findById(decoded.id).select('-refreshTokens');
        if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // Silent fail - just don't attach user
  }
  
  next();
};

module.exports = { protect, authorize, optionalAuth };