// config/auth.js - Auth configuration
module.exports = {
  tokens: {
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRE || '7d',
    cookieDomain: process.env.COOKIE_DOMAIN,
  },
  rateLimiting: {
    login: {
      windowMs: 15 * 60 * 1000,
      maxAttempts: 5,
    },
    api: {
      windowMs: 60 * 60 * 1000,
      maxRequests: 1000,
    }
  },
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
  }
};