const { createLogger, format, transports } = require('winston');

// 1. Definimos los transportes base (Consola)
const logTransports = [
  new transports.Console({
    // Silenciamos la consola totalmente si estamos en modo test
    silent: process.env.NODE_ENV === 'test', 
    format: format.combine(
      format.colorize(),
      format.printf(({ level, message, timestamp, service }) => {
        return `[${timestamp}] [${level}] [${service || 'General'}]: ${message}`;
      })
    )
  })
];

// 2. Agregamos el archivo SOLO si no es modo test
if (process.env.NODE_ENV !== 'test') {
  logTransports.push(
    new transports.File({ filename: 'logs/combined.log' })
  );
}

// 3. Creamos el logger usando el array de transportes que armamos
const logger = createLogger({
  level: process.env.NODE_ENV === 'test' ? 'error' : (process.env.LOG_LEVEL || 'info'),
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: logTransports, // <-- Aquí usamos la variable que armamos arriba
});

module.exports = logger;