const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { encrypt } = require('../utils/encryption');

// Helper: deep merge objects (safe for plain objects, not arrays)
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
  }
  return output;
}
// @desc    Test notification settings
// @route   POST /api/admin/settings/test-notification
// @access  Private/Admin
const testNotification = async (req, res) => {
  try {
    // Here you would trigger a test notification (email, push, etc.)
    // For now, just return a success message
    res.json({ success: true, message: 'Test notification sent (simulated)' });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to send test notification' });
  }
};

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance(req.user.id);
    const settingsObj = settings.toObject();

    // No need to redact sensitive fields – they are select:false
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

// @desc    Update settings (safe sections only)
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getInstance(req.user.id);

    // Define allowed top‑level sections for general update
    const allowedSections = ['profile', 'notifications', 'appearance', 'privacy', 'backup', 'security'];
    const updates = {};

    for (const section of allowedSections) {
      if (req.body[section] && typeof req.body[section] === 'object') {
        // Remove any sensitive subfields inside backup
        if (section === 'backup' && req.body.backup.encryptionKey) {
          delete req.body.backup.encryptionKey; // never update via this endpoint
        }
        // Remove critical security secrets from general update
        if (section === 'security') {
          delete req.body.security.twoFactorSecret;
          delete req.body.security.recoveryCodes;
          delete req.body.security.passwordPolicy; // Use a specialized endpoint for policy if needed
        }
        // Deep merge with existing data
        updates[section] = deepMerge(settings[section]?.toObject() || {}, req.body[section]);
      }
    }

    // Apply the merged updates
    settings.set(updates);
    settings.updatedBy = req.user.id;
    await settings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SETTINGS',
      details: `Updated settings to version ${settings.version}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const settingsObj = settings.toObject();
    res.json({ success: true, message: 'Settings updated', data: settingsObj });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};

// @desc    Generate API key
// @route   POST /api/admin/settings/api-keys
// @access  Private/SuperAdmin
const generateApiKey = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'API key name is required' });
    }

    const settings = await Settings.getInstance(req.user.id);

    const key = `pk_${crypto.randomBytes(16).toString('hex')}`;
    const secret = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const hashedSecret = await bcrypt.hash(secret, 10);

    settings.api.keys.push({
      name,
      key,
      secret: hashedSecret,
      permissions: permissions || ['read'],
      createdAt: new Date(),
      status: 'active'
      // lastUsed and expiresAt are optional
    });

    settings.updatedBy = req.user.id;
    await settings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'GENERATE_API_KEY',
      details: `Generated API key: ${name}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'API key generated',
      data: { name, key, secret, permissions }
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate API key' });
  }
};

// @desc    Revoke API key
// @route   DELETE /api/admin/settings/api-keys/:keyId
// @access  Private/SuperAdmin
const revokeApiKey = async (req, res) => {
  try {
    const settings = await Settings.getInstance(req.user.id);
    const keyIndex = settings.api.keys.findIndex(k => k._id.toString() === req.params.keyId);
    if (keyIndex === -1) {
      return res.status(404).json({ success: false, error: 'API key not found' });
    }

    settings.api.keys[keyIndex].status = 'revoked';
    settings.updatedBy = req.user.id;
    await settings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'REVOKE_API_KEY',
      details: `Revoked API key: ${settings.api.keys[keyIndex].name}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ success: false, error: 'Failed to revoke API key' });
  }
};

// @desc    Export settings (excludes secrets)
// @route   GET /api/admin/settings/export
// @access  Private/Admin
const exportSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance(req.user.id);
    const settingsObj = settings.toObject();

    // Remove all sensitive data (though they are select:false, we still remove)
    delete settingsObj.security?.twoFactorSecret;
    delete settingsObj.security?.recoveryCodes;
    delete settingsObj.api?.keys;
    delete settingsObj.backup?.encryptionKey;

    settingsObj.exportedAt = new Date();
    settingsObj.exportedBy = req.user.id;
    settingsObj.version = settings.version;

    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Export settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to export settings' });
  }
};

// @desc    Import settings (restricted to safe sections)
// @route   POST /api/admin/settings/import
// @access  Private/SuperAdmin
const importSettings = async (req, res) => {
  try {
    const { settings: importedSettings, merge } = req.body;
    let currentSettings = await Settings.getInstance(req.user.id);

    // Only allow overriding non‑critical sections
    const allowedFields = ['appearance', 'notifications', 'privacy'];
    if (merge) {
      // Deep merge allowed sections
      for (const field of allowedFields) {
        if (importedSettings[field]) {
          currentSettings[field] = deepMerge(currentSettings[field]?.toObject() || {}, importedSettings[field]);
        }
      }
    } else {
      // Replace entire allowed sections
      for (const field of allowedFields) {
        if (importedSettings[field]) {
          currentSettings[field] = importedSettings[field];
        }
      }
    }

    currentSettings.updatedBy = req.user.id;
    await currentSettings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'IMPORT_SETTINGS',
      details: `Imported settings (merge: ${merge})`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Settings imported' });
  } catch (error) {
    console.error('Import settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to import settings' });
  }
};

// @desc    Reset specific settings sections to default
// @route   POST /api/admin/settings/reset
// @access  Private/SuperAdmin
const resetSettings = async (req, res) => {
  try {
    const { sections } = req.body; // e.g., ['appearance', 'notifications']
    const settings = await Settings.getInstance(req.user.id);
    const defaultSettings = new Settings();

    const allowedSections = ['appearance', 'notifications', 'privacy'];
    sections.forEach(section => {
      if (allowedSections.includes(section) && defaultSettings[section] !== undefined) {
        settings[section] = defaultSettings[section];
      }
    });

    settings.updatedBy = req.user.id;
    await settings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'RESET_SETTINGS',
      details: `Reset sections: ${sections.join(', ')}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, message: 'Settings reset' });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  generateApiKey,
  revokeApiKey,
  exportSettings,
  importSettings,
  resetSettings,
  testNotification
};