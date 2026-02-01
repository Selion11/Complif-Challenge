const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');

router.post('/create',companyUploads, companyController.createCompany);

module.exports = router;