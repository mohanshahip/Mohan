const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  profile: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    bio: { type: String, default: '' },
    occupation: { type: String, default: '' },
    company: { type: String, default: '' },
    birthday: { type: Date },
    avatar: { type: String },
    coverImage: { type: String },
    socialLinks: {
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' }
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    recoveryCodes: [{ type: String, select: false }],
    loginNotifications: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30 },
    ipWhitelist: [{ type: String }],
    allowedDevices: [{
      deviceId: String,
      deviceName: String,
      lastUsed: Date,
      trusted: { type: Boolean, default: false }
    }],
    passwordExpiryDays: { type: Number, default: 90 }
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['instant', 'hourly', 'daily', 'weekly'], default: 'instant' },
      digestTime: { type: String, default: '09:00' },
      digestDay: { type: String, default: 'monday' },
      marketing: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
      updates: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      vibration: { type: Boolean, default: true },
      priority: { type: String, enum: ['all', 'important', 'critical'], default: 'all' },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '07:00' }
      }
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      showBadge: { type: Boolean, default: true },
      showToast: { type: Boolean, default: true },
      toastDuration: { type: Number, default: 5 },
      position: { type: String, default: 'top-right' },
      maxNotifications: { type: Number, default: 50 },
      groupSimilar: { type: Boolean, default: true }
    },
    types: {
      content: {
        newPoem: { type: Boolean, default: true },
        newProject: { type: Boolean, default: true },
        newGallery: { type: Boolean, default: true },
        newSkill: { type: Boolean, default: true },
        contentUpdate: { type: Boolean, default: true },
        contentApproval: { type: Boolean, default: true }
      },
      interactions: {
        newComment: { type: Boolean, default: true },
        newReply: { type: Boolean, default: true },
        newLike: { type: Boolean, default: true },
        newShare: { type: Boolean, default: true },
        newFollow: { type: Boolean, default: true },
        newMention: { type: Boolean, default: true },
        contactForm: { type: Boolean, default: true }
      },
      system: {
        systemUpdate: { type: Boolean, default: true },
        securityAlert: { type: Boolean, default: true },
        backupComplete: { type: Boolean, default: true },
        backupFailed: { type: Boolean, default: true },
        errorAlert: { type: Boolean, default: true }
      },
      admin: {
        newUser: { type: Boolean, default: true },
        userDeactivated: { type: Boolean, default: true },
        roleChange: { type: Boolean, default: true },
        adminAction: { type: Boolean, default: true }
      },
      analytics: {
        weeklyReport: { type: Boolean, default: true },
        monthlyReport: { type: Boolean, default: true },
        trafficSpike: { type: Boolean, default: false },
        milestoneReached: { type: Boolean, default: true }
      }
    }
  },
  appearance: {
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      primaryColor: { type: String, default: '#6366f1' },
      accentColor: { type: String, default: '#10b981' },
      borderRadius: { type: String, enum: ['none', 'sm', 'md', 'lg', 'full'], default: 'md' },
      density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
      glassMorphism: { type: Boolean, default: true },
      blurIntensity: { type: String, enum: ['none', 'light', 'medium', 'heavy'], default: 'medium' },
      animations: { type: Boolean, default: true },
      animationSpeed: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' }
    },
    language: {
      current: { type: String, default: 'en' },
      defaultLanguage: { type: String, default: 'en' },
      showLanguageSwitcher: { type: Boolean, default: true },
      rtlSupport: { type: Boolean, default: false },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
      firstDayOfWeek: { type: String, default: 'monday' },
      timezone: { type: String, default: 'Asia/Kathmandu' }
    },
    typography: {
      fontFamily: { type: String, default: 'inter' },
      fontSize: { type: String, enum: ['sm', 'base', 'lg', 'xl'], default: 'base' },
      lineHeight: { type: String, enum: ['tight', 'normal', 'relaxed'], default: 'normal' },
      letterSpacing: { type: String, enum: ['tight', 'normal', 'wide'], default: 'normal' },
      fontSmoothing: { type: Boolean, default: true }
    },
    layout: {
      sidebar: {
        collapsed: { type: Boolean, default: false },
        position: { type: String, enum: ['left', 'right'], default: 'left' },
        width: { type: Number, default: 280 },
        collapsedWidth: { type: Number, default: 80 }
      },
      topbar: {
        sticky: { type: Boolean, default: true },
        showBreadcrumbs: { type: Boolean, default: true },
        showSearch: { type: Boolean, default: true },
        showNotifications: { type: Boolean, default: true },
        showProfile: { type: Boolean, default: true }
      },
      content: {
        maxWidth: { type: String, enum: ['sm', 'md', 'lg', 'xl', 'full'], default: 'xl' },
        centered: { type: Boolean, default: true }
      },
      footer: {
        visible: { type: Boolean, default: true },
        showCredits: { type: Boolean, default: true },
        showVersion: { type: Boolean, default: true }
      }
    }
  },
  api: {
    keys: [{
      name: String,
      key: String,
      secret: { type: String, select: false },
      permissions: [String],
      createdAt: Date,
      lastUsed: Date,
      expiresAt: Date,
      status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' }
    }],
    webhooks: [{
      url: String,
      events: [String],
      secret: { type: String, select: false },
      createdAt: Date,
      lastTriggered: Date,
      status: { type: String, enum: ['active', 'paused', 'failed'], default: 'active' }
    }],
    rateLimits: {
      enabled: { type: Boolean, default: true },
      maxRequests: { type: Number, default: 100 },
      windowMs: { type: Number, default: 60000 },
      whitelist: [String]
    },
    cors: {
      enabled: { type: Boolean, default: true },
      allowedOrigins: [String],
      allowedMethods: [String]
    }
  },
  backup: {
    autoBackup: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    time: { type: String, default: '02:00' },
    retentionDays: { type: Number, default: 30 },
    includeFiles: { type: Boolean, default: true },
    includeDatabase: { type: Boolean, default: true },
    compression: { type: Boolean, default: true },
    encryption: { type: Boolean, default: false },
    encryptionKey: { type: String, select: false },
    destination: {
      type: { type: String, enum: ['local', 's3', 'google-drive', 'dropbox'], default: 'local' },
      path: String,
      bucket: String,
      region: String,
      credentials: { type: mongoose.Schema.Types.Mixed, select: false }
    },
    lastBackup: Date,
    lastBackupStatus: String,
    backups: [{
      filename: String,
      size: Number,
      createdAt: Date,
      type: String,
      status: String,
      url: String
    }]
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private', 'admins'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: true },
    activityTracking: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    cookieConsent: { type: Boolean, default: false },
    dataRetention: { type: Number, default: 365 },
    gdprCompliant: { type: Boolean, default: true }
  },
  audit: {
    enabled: { type: Boolean, default: true },
    logLevel: { type: String, enum: ['error', 'warn', 'info', 'debug'], default: 'info' },
    retentionDays: { type: Number, default: 30 },
    excludePaths: [String],
    excludeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    detailedLogging: { type: Boolean, default: false }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

SettingsSchema.statics.getInstance = async function (userId) {
  const settings = await this.findOneAndUpdate(
    {}, // empty filter – there should be only one document
    { $setOnInsert: { createdBy: userId, updatedBy: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return settings;
};
// Prevent model overwrite error
module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);