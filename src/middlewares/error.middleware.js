const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    service: 'GlobalErrorHandler', 
    message: err.message,
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

module.exports = errorHandler;