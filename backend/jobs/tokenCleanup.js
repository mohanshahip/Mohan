// jobs/tokenCleanup.js
const User = require("../models/User");
const logger = require("../utils/Logger");

// Remove expired refresh tokens + reset locks
const cleanupExpiredTokens = async () => {
  try {
    // Remove expired refresh tokens
    const result = await User.updateMany(
      {},
      {
        $pull: {
          refreshTokens: {
            expiresAt: { $lt: new Date() },
          },
        },
      }
    );

    // Reset locked accounts if lock time passed
    const lockReset = await User.updateMany(
      {
        lockUntil: { $lt: new Date() },
        loginAttempts: { $gt: 0 },
      },
      {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      }
    );

    // Remove unverified users older than 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unverifiedRemoved = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: yesterday }
    });

    logger.info(
      `🧹 Cleanup complete: ${result.modifiedCount} tokens removed, ${lockReset.modifiedCount} locks reset, ${unverifiedRemoved.deletedCount} unverified users cleaned`
    );
  } catch (error) {
    logger.error(`❌ Token cleanup error: ${error.message}`);
  }
};

// ✅ Start Cleanup Job Automatically Every Hour
const startTokenCleanup = () => {
  logger.info("✅ Token cleanup job started...");

  // Run immediately once
  cleanupExpiredTokens();

  // Run every 1 hour
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
};

// ✅ Export correctly
module.exports = { startTokenCleanup };
