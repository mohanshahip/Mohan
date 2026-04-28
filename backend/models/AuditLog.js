// backend/models/AuditLog.js
const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: false 
    },
    action: { 
      type: String, 
      required: true,
      enum: [
        // Admin management
        'CREATE_ADMIN', 
        'DELETE_ADMIN', 
        'TOGGLE_ADMIN_STATUS',
        'AUTH_ACTION',
        'ADMIN_ACTION',
        
        // Authentication
        'LOGIN',
        'LOGOUT',
        'PASSWORD_RESET',
        'PASSWORD_CHANGE',
        'PROFILE_UPDATE',
        
        // Settings management (ADD THESE)
        'UPDATE_SETTINGS',
        'GENERATE_API_KEY',
        'REVOKE_API_KEY',
        'TEST_NOTIFICATION',
        'IMPORT_SETTINGS',
        'RESET_SETTINGS',
        'EXPORT_SETTINGS',
        
        // Backup operations
        'BACKUP_CREATED',
        'BACKUP_RESTORED',
        'BACKUP_DELETED',
        
        // Security
        'TWO_FACTOR_ENABLED',
        'TWO_FACTOR_DISABLED',
        'RECOVERY_CODES_GENERATED',
        'SECURITY_QUESTIONS_UPDATED',
        
        // API operations
        'WEBHOOK_CREATED',
        'WEBHOOK_UPDATED',
        'WEBHOOK_DELETED',
        'WEBHOOK_TESTED'
      ]
    },
    ip: { 
      type: String,
      required: false 
    },
    userAgent: { 
      type: String,
      required: false 
    },
    method: { 
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      required: false 
    },
    path: { 
      type: String,
      required: false 
    },
    body: { 
      type: mongoose.Schema.Types.Mixed,
      required: false 
    },
    statusCode: { 
      type: Number,
      required: false 
    },
    response: { 
      type: mongoose.Schema.Types.Mixed,
      required: false 
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

module.exports = mongoose.model("AuditLog", AuditLogSchema);