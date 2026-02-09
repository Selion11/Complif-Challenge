const express = require('express');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * tags:
 * name: Companies
 * description: Gestión de legajos, cálculo de riesgo y trazabilidad de empresas
 */

// Todas las rutas de este archivo requieren un token JWT válido
router.use(authenticate);

/**
 * @openapi
 * /api/companies:
 * get:
 * summary: Listar todas las empresas
 * description: Permite filtrar por país o industria. Los Viewers solo ven su propia empresa.
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: country
 * schema:
 * type: string
 * description: Filtrar por país
 * - in: query
 * name: industry
 * schema:
 * type: string
 * description: Filtrar por sector industrial
 * responses:
 * 200:
 * description: Listado obtenido con éxito.
 */
router.get('/', companyController.listCompanies);

/**
 * @openapi
 * /api/companies/{cuit}:
 * get:
 * summary: Obtener detalle de una empresa
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Información detallada de la entidad.
 */
router.get('/:cuit', companyController.getCompanyDetail);

/**
 * @openapi
 * /api/companies/{cuit}/documents:
 * get:
 * summary: Listar documentos de la empresa
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Referencias a los documentos subidos.
 */
router.get('/:cuit/documents', companyController.listDocuments);

/**
 * @openapi
 * /api/companies/{cuit}/risk-score:
 * get:
 * summary: Obtener puntaje de riesgo automático
 * description: Calcula el riesgo basado en país, industria y completitud de legajo.
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Resultado del cálculo de riesgo.
 */
router.get('/:cuit/risk-score', companyController.getRiskScore);

/**
 * @openapi
 * /api/companies/create:
 * post:
 * summary: Registrar nueva empresa (Solo Admin)
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * cuit:
 * type: string
 * country:
 * type: string
 * industry:
 * type: string
 * files:
 * type: array
 * items:
 * type: string
 * format: binary
 * responses:
 * 201:
 * description: Empresa creada y archivos procesados.
 */
router.post('/create', isAdmin, companyUploads, companyController.createCompany);

/**
 * @openapi
 * /api/companies/{cuit}/documents:
 * patch:
 * summary: Actualizar un documento específico (Solo Admin)
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * requestBody:
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * file:
 * type: string
 * format: binary
 * responses:
 * 200:
 * description: Documento actualizado.
 */
router.patch('/:cuit/documents', isAdmin, companyUploads, companyController.updateSingleDocument);

/**
 * @openapi
 * /api/companies/{cuit}/status:
 * patch:
 * summary: Cambiar estado de aprobación (Solo Admin)
 * description: Registra la transición en el historial de estados para auditoría.
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * enum: [PENDING, APPROVED, REJECTED]
 * comment:
 * type: string
 * responses:
 * 200:
 * description: Estado actualizado y registrado en historial.
 */
router.patch('/:cuit/status', isAdmin, companyController.updateStatus);

module.exports = router;