const express = require('express');
const errorHandler = require('./middlewares/error.middleware');
const authenticate = require('./middlewares/auth.middleware')
const logger = require('./utils/logger');

const companyRoutes = require('./routes/company.routes');
const systemRoutes = require('./routes/system.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

//PUBLIC ROUTES
app.use('/health',systemRoutes);
app.use('/api/auth',authRoutes)

//PROTECTED ROUTES: unauthorized users cannot access them
app.use('/api/companies',authenticate, companyRoutes);
;

app.use((req,res,next) => {
  const error = new Error(`La ruta ${req.originalUrl} con el metodo ${req.method} no existe.`);
  error.statusCode = 404;
  next(error);
})

//GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app; 