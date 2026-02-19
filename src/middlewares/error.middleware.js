const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  if (statusCode === 500) {
      console.log("\nERROR 500:", err.message);
  }

  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.url
  };

  if (err.errors && Array.isArray(err.errors)) {
    errorResponse.errors = err.errors;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;