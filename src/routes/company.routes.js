const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');

router.post('/create',companyUploads, companyController.createCompany);
router.get('/:cuit/documents',companyController.listDocuments);

module.exports = router;