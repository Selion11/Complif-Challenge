const { createLogger, format, transports } = require('winston');

const customFormat = format.printf(({ level, message, timestamp, service }) => {
  // Formato: [2026-01-31 14:30:00] [INFO] [ServiceName]: Mensaje
  return `[${timestamp}] [${level.toUpperCase()}] [${service || 'General'}]: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, service }) => {
          return `[${timestamp}] [${level}] [${service || 'General'}]: ${message}`;
        })
      )
    }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
});

module.exports = logger;