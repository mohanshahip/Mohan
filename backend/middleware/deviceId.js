// middleware/deviceId.js

/**
 * Middleware to require a valid device ID header.
 * Use on all protected routes and refresh token endpoint.
 */
const deviceIdRequired = (req, res, next) => {
  const deviceId = req.headers['x-device-id'];

  if (!deviceId || typeof deviceId !== 'string' || deviceId.trim().length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Valid device ID required (minimum 8 characters)'
    });
  }

  // Attach cleaned deviceId to request object for later use
  req.deviceId = deviceId.trim();
  next();
};

module.exports = deviceIdRequired;