const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Mantenemos tu bloque de debug pero más limpio
  if (statusCode === 500) {
      console.log("\n🔥 ERROR 500 DETECTADO:", err.message);
  }

  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // Solo enviamos 'errors' si realmente es un array (evita el crash del map)
  if (err.errors && Array.isArray(err.errors)) {
    errorResponse.errors = err.errors;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;