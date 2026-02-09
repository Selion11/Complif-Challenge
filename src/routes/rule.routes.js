const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller');

/**
 * @openapi
 * tags:
 * name: Rules
 * description: Definición de reglas de negocio y combinatorias de firmas por empresa
 */

/**
 * @openapi
 * /api/rules:
 * post:
 * summary: Crear una nueva regla de firma
 * description: Define los requisitos de firma para una empresa (ej. 1 firma del Grupo A + 1 firma del Grupo B).
 * tags: [Rules]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - companyCuit
 * - requirementType
 * properties:
 * companyCuit:
 * type: string
 * example: "30111111118"
 * requirementType:
 * type: string
 * enum: [SIMPLE, COMBINED]
 * example: "COMBINED"
 * config:
 * type: object
 * description: Configuración detallada de los grupos requeridos.
 * responses:
 * 201:
 * description: Regla creada exitosamente.
 * 403:
 * description: Acceso denegado. Solo administradores pueden configurar reglas.
 */
router.post('/', ruleController.createRule);

/**
 * @openapi
 * /api/rules:
 * get:
 * summary: Consultar reglas de una empresa
 * description: Retorna las reglas de firma vigentes para una entidad específica.
 * tags: [Rules]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: companyCuit
 * required: true
 * schema:
 * type: string
 * description: CUIT de la empresa a consultar
 * responses:
 * 200:
 * description: Listado de reglas obtenido exitosamente.
 * 404:
 * description: Empresa no encontrada.
 */
router.get('/', ruleController.getRulesByCompany);

module.exports = router;