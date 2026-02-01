const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // 1. Manejo específico para errores de Multer (Límites de tamaño, etc)
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.message = 'El archivo es demasiado grande. Máximo 5MB.';
    err.statusCode = 400;
  }

  // 2. Logging enriquecido
  logger.error({
    service: 'GlobalErrorHandler', 
    message: err.message,
    method: req.method,
    url: req.url,
    // Agregamos el ID de la transacción o el body para saber qué rompió el server
    requestId: req.headers['x-request-id'] || 'N/A', 
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    // Información extra para el desarrollador
    timestamp: new Date().toISOString(),
    path: req.url,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

module.exports = errorHandler;