// middleware/noCache.js
/**
 * Middleware to prevent caching of API responses.
 * Essential for production security to ensure sensitive data (like user info or CSRF tokens)
 * is never stored in browser or intermediary caches.
 */
const noCache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

module.exports = noCache;
