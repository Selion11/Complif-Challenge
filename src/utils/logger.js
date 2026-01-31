const { createLogger, format, transports } = require('winston');

const customFormat = format.printf(({ level, message, timestamp, service }) => {
  // Formato: [2026-01-31 14:30:00] [INFO] [ServiceName]: Mensaje
  return `[${timestamp}] [${level.toUpperCase()}] [${service || 'General'}]: ${message}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
    customFormat  
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/combined.log' })
  ],
});

module.exports = logger;