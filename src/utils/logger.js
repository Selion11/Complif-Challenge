const { createLogger, format, transports } = require('winston');

const logTransports = [
  new transports.Console({
    silent: process.env.NODE_ENV === 'test', 
    format: format.combine(
      format.colorize(),
      format.printf(({ level, message, timestamp, service }) => {
        return `[${timestamp}] [${level}] [${service || 'General'}]: ${message}`;
      })
    )
  })
];

if (process.env.NODE_ENV !== 'test') {
  logTransports.push(
    new transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = createLogger({
  level: process.env.NODE_ENV === 'test' ? 'error' : (process.env.LOG_LEVEL || 'info'),
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: logTransports, 
});

module.exports = logger;