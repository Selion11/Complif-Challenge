const express = require('express');
const app = express();
const companyRoutes = require('./routes/company.routes');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

//ROUTES
app.use('/api/companies', companyRoutes);

app.use(errorHandler);
module.exports = app; 