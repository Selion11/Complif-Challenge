const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', companyController.listCompanies);
router.get('/:cuit', companyController.getCompanyDetail);
router.get('/:cuit/documents', companyController.listDocuments);
router.get('/:cuit/risk-score', companyController.getRiskScore);

router.post('/create', isAdmin, companyUploads, companyController.createCompany);
router.patch('/:cuit/documents', isAdmin, companyUploads, companyController.updateSingleDocument);
router.patch('/:cuit/status', isAdmin, companyController.updateStatus);

module.exports = router;