const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');

router.post('/create', companyController.createCompany);

module.exports = router;