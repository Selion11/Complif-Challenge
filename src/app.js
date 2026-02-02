const express = require('express');
const app = express();
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const companyRoutes = require('./routes/company.routes');
const systemRoutes = require('./routes/system.routes')

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

//ROUTES
app.use('/api/companies', companyRoutes);
app.use('/health',systemRoutes)

app.use((req,res,next) => {
  const error = new Error(`La ruta ${req.originalUrl} con el metodo ${req.method} no existe.`);
  error.statusCode = 404;
  next(error);
})

app.use(errorHandler);
module.exports = app; 