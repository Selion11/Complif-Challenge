const express = require('express');
const app = express();
const companyRoutes = require('./routes/company.routes');

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

//ROUTES
app.use('/api/companies', companyRoutes);

module.exports = app; 