const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller');

/**
 * @openapi
 * tags:
 * name: Rules
 * description: Definición de reglas de firma
 */

/**
 * @openapi
 * /api/rules:
 * post:
 * summary: Crear una nueva regla de firma
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
 * requirementType:
 * type: string
 * enum: [SIMPLE, COMBINED]
 * responses:
 * 201:
 * description: Regla creada.
 * get:
 * summary: Consultar reglas de una empresa
 * tags: [Rules]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: companyCuit
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Listado de reglas.
 */
router.post('/', ruleController.createRule);
router.get('/', ruleController.getRulesByCompany);

module.exports = router;