// middleware/auditLogger.js
const AuditLog = require('../models/AuditLog');

// Helper to sanitize sensitive data
const sanitizeBody = (body) => {
  if (!body) return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'confirmPassword', 'token', 'refreshToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

const auditLogger = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to capture response
    res.json = function(data) {
      // Restore original json
      res.json = originalJson;
      
      // Log asynchronously (don't await)
      AuditLog.create({
        user: req.user?.id,
        action,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.originalUrl || req.path,
        body: sanitizeBody(req.body),
        statusCode: res.statusCode,
        response: data
      }).catch(err => console.error('Audit log error:', err));
      
      // Call original json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLogger;