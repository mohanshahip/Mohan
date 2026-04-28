// services/socketService.js
const logger = require("../utils/Logger");
let io = null;
const userSockets = new Map();

module.exports = {
  initialize: (socketIo) => {
    io = socketIo;
    
    // Socket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token provided"));

      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        // Verify it's an access token
        if (decoded.type !== 'access') {
          return next(new Error("Invalid token type"));
        }
        
        socket.userId = decoded.id;
        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          next(new Error("Token expired"));
        } else {
          next(new Error("Authentication error"));
        }
      }
    });

    io.on("connection", (socket) => {
      logger.info(`✅ User connected: ${socket.userId}`);
      userSockets.set(socket.userId.toString(), socket.id);

      socket.on("disconnect", () => {
        logger.info(`❌ User disconnected: ${socket.userId}`);
        userSockets.delete(socket.userId.toString());
      });

      // Handle ping/pong for connection health check
      socket.on("ping", (callback) => {
        if (typeof callback === "function") {
          callback({ status: "ok", timestamp: Date.now() });
        }
      });
    });

    logger.info("✅ Socket service initialized");
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },

  notifyUserDeactivation: (userId) => {
    if (!io) {
      logger.warn("⚠️ Socket.io not initialized, cannot send notification");
      return false;
    }
    
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit("account_deactivated", {
        message: "Your account has been deactivated by an administrator.",
        timestamp: new Date().toISOString()
      });
      logger.info(`📢 Deactivation notification sent to user ${userId}`);
      return true;
    }
    
    logger.info(`⚠️ User ${userId} not connected, notification not sent`);
    return false;
  },

  notifyUser: (userId, event, data) => {
    if (!io) return false;
    
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  },

  broadcastToRole: (role, event, data) => {
    if (!io) return;
    // This would require storing user roles in the socket map
    // For now, just broadcast to all
    io.emit(event, data);
  },

  notifyStatsUpdate: (data) => {
    if (!io) return;
    io.emit("stats_update", data);
  },

  notifyNewActivity: (activity) => {
    if (!io) return;
    io.emit("new_activity", activity);
  },

  notifyAdminCreation: (admin) => {
    if (!io) return;
    io.emit("admin_created", {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      profile: admin.profile,
      createdAt: admin.createdAt
    });
  },

  getConnectedUsersCount: () => {
    return userSockets.size;
  }
};