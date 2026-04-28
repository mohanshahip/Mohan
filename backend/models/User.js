const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper to hash a token using SHA‑256
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profile: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      avatar: { type: String },
    },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Email OTP fields
    otp: {
      code: String,
      expiresAt: Date,
    },
    // Store hashed refresh tokens instead of plain JWTs
    refreshTokens: [
      {
        tokenHash: { type: String, required: true }, // SHA‑256 hash of the refresh token
        deviceId: { type: String, required: true },
        userAgent: String,
        ip: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ---------- Pre-save hooks ----------
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// ---------- Instance methods ----------
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

userSchema.methods.generateRefreshToken = function (deviceId = 'default', userAgent = '', ip = '') {
  const token = jwt.sign(
    { id: this._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(token);

  this.refreshTokens.push({
    tokenHash,
    deviceId,
    userAgent,
    ip,
    expiresAt,
  });

  // Keep only the latest 10 tokens total to prevent document bloat
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }
  
  return token; // return the plain JWT to the client
};

// Remove the redundant addRefreshToken method
// userSchema.methods.addRefreshToken = ...

userSchema.methods.removeAllRefreshTokens = function () {
  this.refreshTokens = [];
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ---------- Login attempt handling ----------
userSchema.methods.incrementLoginAttempts = async function () {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  // Ensure loginAttempts is loaded
  if (this.loginAttempts === undefined) {
    const user = await this.constructor.findById(this._id).select('+loginAttempts +lockUntil');
    this.loginAttempts = user.loginAttempts;
    this.lockUntil = user.lockUntil;
  }

  // If lock has expired, reset attempts and lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if ((this.loginAttempts || 0) + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  return this.updateOne(updates);
};

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// ---------- Password reset ----------
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// ---------- Email OTP methods ----------
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = {
    code: crypto.createHash('sha256').update(otp).digest('hex'),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
  return otp; // return the plain code to send via email
};

userSchema.methods.verifyOTP = function (code) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) return false;
  if (this.otp.expiresAt < Date.now()) return false;
  
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  return this.otp.code === hashedCode;
};

userSchema.methods.clearOTP = function () {
  this.otp = undefined;
};

module.exports = mongoose.model('User', userSchema);