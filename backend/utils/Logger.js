// utils/logger.js
const winston = require('winston');
require('winston-daily-rotate-file'); // ✅ IMPORTANT

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Console format (clean + colored)
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`;
  })
);

// File format (JSON for production)
const fileFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

// Create logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports: [
    // Console
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // Error logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exitOnError: false,
});

// Morgan stream support
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;