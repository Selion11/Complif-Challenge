const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const companyUploads = require('../middlewares/upload.middleware');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCompanySchema, updateStatusSchema } = require('../validations/company.validation');

/**
 * @openapi
 * tags:
 * name: Companies
 * description: Gestión de legajos y cálculo de riesgo
 */

router.use(authenticate);

/**
 * @openapi
 * /api/companies:
 * get:
 * summary: Listar todas las empresas
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: country
 * schema:
 * type: string
 * - in: query
 * name: industry
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Listado obtenido con éxito.
 */
router.get('/', companyController.listCompanies);


/**
 * @openapi
 * /api/companies/{cuit}/users:
 * get:
 * summary: Obtener usuarios por empresa
 * description: Retorna la lista de usuarios asociados a un CUIT específico.
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * description: CUIT de la empresa para filtrar usuarios
 * responses:
 * 200:
 * description: Listado de usuarios obtenido con éxito.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * username:
 * type: string
 * role:
 * type: string
 * 401:
 * description: No autorizado - Token faltante o inválido.
 * 404:
 * description: Empresa no encontrada.
 */
router.get('/:cuit/users', companyController.getUsersByCompany);

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
 * description: Empresa creada.
 */
router.post('/create', isAdmin, companyUploads, validate(createCompanySchema), companyController.createCompany);

/**
 * @openapi
 * /api/companies/{cuit}:
 * get:
 * summary: Obtener detalle de una empresa
 * tags: [Companies]
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Información detallada.
 */
router.get('/:cuit', companyController.getCompanyDetail);

/**
 * @openapi
 * /api/companies/{cuit}/documents:
 * get:
 * summary: Listar documentos de la empresa
 * tags: [Companies]
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Lista de documentos.
 * patch:
 * summary: Actualizar un documento específico (Solo Admin)
 * tags: [Companies]
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
router.get('/:cuit/documents', companyController.listDocuments);
router.patch('/:cuit/documents', isAdmin, companyUploads, companyController.updateSingleDocument);

/**
 * @openapi
 * /api/companies/{cuit}/risk-score:
 * get:
 * summary: Obtener puntaje de riesgo
 * tags: [Companies]
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Puntaje calculado.
 */
router.get('/:cuit/risk-score', companyController.getRiskScore);

/**
 * @openapi
 * /api/companies/{cuit}/status:
 * patch:
 * summary: Cambiar estado de aprobación
 * tags: [Companies]
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
 * description: Estado actualizado.
 */
router.patch('/:cuit/status', isAdmin, validate(updateStatusSchema), companyController.updateStatus);

/**
 * @openapi
 * /api/companies/{cuit}/status-history:
 * get:
 * summary: Obtener historial de estados de una empresa
 * description: Retorna una lista cronológica de todos los cambios de estado que ha tenido la empresa, incluyendo comentarios y el usuario que realizó la acción.
 * tags: [Companies]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: cuit
 * required: true
 * schema:
 * type: string
 * description: CUIT de la empresa para consultar su historial
 * responses:
 * 200:
 * description: Historial de auditoría obtenido con éxito.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * data:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * estado_anterior:
 * type: string
 * estado_nuevo:
 * type: string
 * comentario:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 * User:
 * type: object
 * properties:
 * username:
 * type: string
 * 401:
 * description: No autorizado.
 * 404:
 * description: Empresa no encontrada.
 */
router.get('/:cuit/status-history', authenticate, companyController.getStatusHistory);

module.exports = router;