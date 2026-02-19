const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errorDetails = (result.error?.issues || []).map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));

    const validationError = new Error('Error de validación en los datos de entrada');
    validationError.statusCode = 400;
    validationError.errors = errorDetails;

    return next(validationError); 
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;
  
  next();
};

module.exports = validate;