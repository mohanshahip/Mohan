// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const logger = require('../utils/Logger');
const CSRF = require('csrf');
const tokens = new CSRF();

// Helper to hash a token using SHA‑256 (matches User.js)
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Helper function to set cookies (unified)
const setTokenCookies = (res, accessToken, refreshToken, generateCsrf = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Base cookie options
  const cookieOptions = {
    httpOnly: true,
    // For localhost development, secure must be false unless using HTTPS.
    // Use 'lax' for same-site (localhost to localhost) in development.
    // Use 'none' for cross-site (production) which REQUIRES secure: true.
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    path: '/',
  };

  // Auth tokens
  res.cookie('accessToken', accessToken, { 
    ...cookieOptions, 
    maxAge: 15 * 60 * 1000 
  });
  
  res.cookie('refreshToken', refreshToken, { 
    ...cookieOptions, 
    maxAge: 7 * 24 * 60 * 60 * 1000 
  });
  
  // Set a non-httpOnly cookie for the frontend to know we are logged in
  // MUST NOT use ...cookieOptions directly because of httpOnly: true
  res.cookie('authenticated', 'true', {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: '/',
    httpOnly: false,
    maxAge: 7 * 24 * 60 * 60 * 1000 // same as refreshToken
  });

  // Regenerate CSRF tokens upon login/refresh to prevent session fixation
  if (generateCsrf) {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);

    // CSRF Secret (httpOnly)
    res.cookie('csrfSecret', secret, {
      ...cookieOptions,
      httpOnly: true,
    });

    // CSRF Token (non-httpOnly for frontend to read)
    res.cookie('csrfToken', token, {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: '/',
      httpOnly: false,
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername }
      ]
    });

    if (userExists) {
      // If user exists but is not verified, we can allow re-registration
      // This will update the existing unverified user's details and send a new OTP
      if (!userExists.isVerified) {
        userExists.username = username;
        userExists.password = password;
        userExists.profile = { firstName, lastName };
        
        const otp = userExists.generateOTP();
        await userExists.save();

        // Send email (async)
        emailService.sendOTPEmail(userExists.email, otp, 'verification')
          .then(result => logger.info(`New OTP Email sent to ${userExists.email}`))
          .catch(err => logger.error(`Failed to resend verification email to ${userExists.email}: ${err.message}`));

        return res.status(200).json({
          success: true,
          message: 'Account exists but is unverified. A new verification code has been sent to your email.',
          email: userExists.email
        });
      }

      return res.status(400).json({
        success: false,
        error: userExists.email === normalizedEmail 
          ? 'Email already in use' 
          : 'Username already taken'
      });
    }

    // Create new user instance
    const user = new User({
      username,
      email: normalizedEmail,
      password,
      profile: {
        firstName,
        lastName
      }
    });

    // Generate verification OTP
    const otp = user.generateOTP();

    // Save user with OTP
    await user.save();

    // Log activity
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      user: user._id,
      action: 'REGISTER',
      details: `New user registered: ${username}`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send email (async, don't block response)
    emailService.sendOTPEmail(user.email, otp, 'verification')
      .then(result => logger.info(`OTP Email sent to ${user.email}`))
      .catch(err => logger.error(`Failed to send verification email to ${user.email}: ${err.message}`));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      email: user.email
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    const isValid = user.verifyOTP(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    user.isVerified = true;
    user.clearOTP();
    
    // Create first refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(
      req.headers['x-device-id'] || 'default',
      req.headers['user-agent'],
      req.ip
    );
    
    // Save everything at once
    await user.save();

    setTokenCookies(res, accessToken, refreshToken, true);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Email verification failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // DEBUG LOG
    logger.debug(`Login attempt for email: ${email}`);
    
    // Select hidden fields explicitly
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      logger.warn(`Login attempt for unknown email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // EXHAUSTIVE DEBUG LOG
    logger.info(`--- LOGIN DEBUG [${email}] ---`);
    logger.info(`User Object Found: ${user._id}`);
    logger.info(`isActive value: ${user.isActive} (type: ${typeof user.isActive})`);
    logger.info(`isVerified value: ${user.isVerified} (type: ${typeof user.isVerified})`);
    logger.info(`Role: ${user.role}`);
    logger.info(`Locked until: ${user.lockUntil}`);
    logger.info(`Login attempts: ${user.loginAttempts}`);
    logger.info(`------------------------------`);

    // Check if user is active - strictly check for false
    if (user.isActive === false) {
      logger.warn(`Login attempt for inactive user: ${user.email}`);
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Check if user is verified - strictly check for false
    if (user.isVerified === false) {
      logger.warn(`Login attempt for unverified user: ${user.email}`);
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in.',
        unverified: true
      });
    }

    // Check if account is locked
   if (user.isLocked) {
      const lockTimeLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `Account locked. Try again in ${lockTimeLeft} minutes`
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${user.email}`);
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(
      req.headers['x-device-id'] || 'default',
      req.headers['user-agent'],
      req.ip
    );
    
    // Save refresh token to DB
    await User.updateOne(
      { _id: user._id },
      { $set: { refreshTokens: user.refreshTokens } }
    );

    // Set cookies using unified helper (regenerate CSRF)
    setTokenCookies(res, accessToken, refreshToken, true);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (with refresh token)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const deviceId = req.headers['x-device-id'];

    if (!refreshToken || !deviceId) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.tokenHash': hashToken(refreshToken),
      'refreshTokens.deviceId': deviceId,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({
        success: false,
        error: 'Password recently changed. Please login again.'
      });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken(
      deviceId,
      req.headers['user-agent'],
      req.ip
    );

    // Filter out the old token by its hash
    const oldTokenHash = hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter(rt => rt.tokenHash !== oldTokenHash);
    
    await user.save({ validateBeforeSave: false });

    // Refresh cookies and also regenerate CSRF for safety
    setTokenCookies(res, newAccessToken, newRefreshToken, true);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const refreshToken = req.cookies.refreshToken;

    if (req.user && deviceId) {
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: { deviceId } } }
      );
    } else if (req.user && refreshToken) {
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } } }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    };

    res.clearCookie('accessToken', clearCookieOptions);
    res.clearCookie('refreshToken', clearCookieOptions);
    res.clearCookie('csrfSecret', clearCookieOptions);
    
    // Non-httpOnly cookies
    res.clearCookie('authenticated', { ...clearCookieOptions, httpOnly: false });
    res.clearCookie('csrfToken', { ...clearCookieOptions, httpOnly: false });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { refreshTokens: [] } }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    };

    res.clearCookie('accessToken', clearCookieOptions);
    res.clearCookie('refreshToken', clearCookieOptions);
    res.clearCookie('csrfSecret', clearCookieOptions);
    
    // Non-httpOnly cookies
    res.clearCookie('authenticated', { ...clearCookieOptions, httpOnly: false });
    res.clearCookie('csrfToken', { ...clearCookieOptions, httpOnly: false });

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });

  } catch (error) {
    logger.error(`Logout all error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // If optionalAuth didn't find a user, req.user will be undefined
    if (!req.user) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        error: 'Not authenticated'
      });
    }

    const user = await User.findById(req.user.id).select('-refreshTokens');
    
    if (!user) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    // Use case‑insensitive query for safety
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact an administrator.'
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Also generate and send OTP for better user experience
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    try {
      // Send both reset link and OTP
      await emailService.sendOTPEmail(user.email, otp, 'passwordReset');
      
      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a reset link and OTP'
      });
    } catch (emailError) {
      logger.error(`Email sending failed for ${user.email}: ${emailError.message}`);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        error: 'Failed to send reset email. Please try again later.'
      });
    }

  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to process request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = [];

    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isValid = user.verifyOTP(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // OTP is valid, generate a temporary reset token for password update
    const resetToken = user.generatePasswordResetToken();
    user.clearOTP();
    await user.save();

    res.json({
      success: true,
      resetToken,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'OTP verification failed'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new OTP has been sent'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    await emailService.sendOTPEmail(user.email, otp, type || 'verification');

    res.json({
      success: true,
      message: 'New verification code has been sent to your email'
    });

  } catch (error) {
    logger.error(`Resend OTP error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification code'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, name, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        });
      }
      user.email = email.toLowerCase();
    }

    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (avatar !== undefined) user.profile.avatar = avatar;
    
    // Handle 'name' field from frontend which might be a single string
    if (name !== undefined) {
      const nameParts = name.split(' ');
      user.profile.firstName = nameParts[0] || '';
      user.profile.lastName = nameParts.slice(1).join(' ') || '';
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        name: `${user.profile.firstName} ${user.profile.lastName}`.trim()
      }
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect current password'
      });
    }

    user.password = newPassword;
    user.refreshTokens = []; // Log out from other devices for security
    await user.save();

    // Generate new tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(
      req.headers['x-device-id'] || 'default',
      req.headers['user-agent'],
      req.ip
    );

    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  updateProfile,
  updatePassword
};