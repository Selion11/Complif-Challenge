const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');

router.post('/create',companyUploads, companyController.createCompany);
router.get('/:cuit/documents',companyController.listDocuments);
router.patch('/:cuit/documents',companyUploads, companyController.updateSingleDocument);
router.get('/:cuit/risk-score',companyController.getRiskScore);
router.get('/:cuit', companyController.getCompanyDetail);
router.patch('/:cuit/status', companyController.updateStatus);
router.get('/', companyController.listCompanies);

module.exports = router;