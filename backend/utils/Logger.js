const winston = require("winston");

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
});

logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;