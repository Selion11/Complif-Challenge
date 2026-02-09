const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

/**
 * @openapi
 * tags:
 * name: Requests
 * description: Gestión de solicitudes de firma y validación de facultades
 */

/**
 * @openapi
 * /api/requests:
 * post:
 * summary: Crear una nueva solicitud de firma
 * description: Inicia un proceso de firma para un documento específico de una empresa.
 * tags: [Requests]
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
 * - documentId
 * - title
 * properties:
 * companyCuit:
 * type: string
 * example: "30111111118"
 * documentId:
 * type: integer
 * example: 1
 * title:
 * type: string
 * example: "Firma de Contrato de Servicios"
 * responses:
 * 201:
 * description: Solicitud creada exitosamente.
 * 403:
 * description: Acceso denegado.
 */
router.post('/', requestController.createRequest);

/**
 * @openapi
 * /api/requests/{requestId}/sign:
 * post:
 * summary: Firmar una solicitud existente
 * description: Registra la firma del usuario actual y verifica si se han cumplido las reglas de firma necesarias para completar el proceso.
 * tags: [Requests]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: requestId
 * required: true
 * schema:
 * type: integer
 * description: ID de la solicitud a firmar
 * responses:
 * 200:
 * description: Firma registrada. El estado de la solicitud puede haber cambiado a 'COMPLETED' si se cumplió la regla.
 * 400:
 * description: El usuario ya ha firmado o la solicitud no está en estado pendiente.
 * 404:
 * description: Solicitud no encontrada.
 */
router.post('/:requestId/sign', requestController.signRequest);

module.exports = router;