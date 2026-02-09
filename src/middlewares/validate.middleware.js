const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    logger.warn({
      event: 'VALIDATION_FAILED',
      service: 'ValidationService',
      actor: req.user ? req.user.username : 'anonymous',
      path: req.originalUrl,
      method: req.method,
      cuit: req.body.cuit || req.params.cuit || 'N/A',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });

    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos de entrada',
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

module.exports = validate;