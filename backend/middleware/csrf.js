// middleware/csrf.js
const csrf = require('csrf');
const tokens = new csrf();

/**
 * CSRF Protection Middleware (Double-Submit Cookie)
 * - On successful login (POST /api/auth/login), generates a new secret (httpOnly) and token (non-httpOnly).
 * - For all non‑GET requests, verifies that the token from the `x-csrf-token` header matches the secret cookie.
 * - Must be placed after cookieParser() and before your routes.
 */
const csrfProtection = (req, res, next) => {
  // --- Generate or refresh CSRF tokens on safe requests if missing ---
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const existingSecret = req.cookies?.csrfSecret;
    const existingToken = req.cookies?.csrfToken;

    if (!existingSecret || !existingToken) {
      const secret = tokens.secretSync();
      const token = tokens.create(secret);

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax', // Use 'none' for cross-site compatibility in production
        path: '/',
      };

      // Set httpOnly cookie for the secret (cannot be read by JavaScript)
      res.cookie('csrfSecret', secret, {
        ...cookieOptions,
        httpOnly: true,
      });

      // Set non-httpOnly cookie for the token (readable by frontend)
      res.cookie('csrfToken', token, {
        ...cookieOptions,
        httpOnly: false,
      });
    }
    return next();
  }

  // --- Verify CSRF token for state-changing requests ---
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Skip CSRF verification for initial login/register/refresh to allow tokens to be set/rotated
    const skipCsrfEndpoints = [
      '/api/auth/login', 
      '/api/auth/register', 
      '/api/auth/forgot-password', 
      '/api/auth/refresh-token',
      '/api/auth/verify-email',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp'
    ];
    if (skipCsrfEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
      return next();
    }

    const secret = req.cookies?.csrfSecret;
    const token = req.headers['x-csrf-token']; // MUST be in header for proper protection

    if (!secret || !token) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token missing from headers',
      });
    }

    if (!tokens.verify(secret, token)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid CSRF token',
      });
    }
  }

  next();
};

module.exports = csrfProtection;