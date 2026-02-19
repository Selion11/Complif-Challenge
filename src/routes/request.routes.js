const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

// ✅ Importación corregida desestructurando los nombres reales del middleware
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * tags:
 * name: Requests
 * description: Gestión de solicitudes de firma y validación de facultades
 */

// ✅ Middleware global para este router: Protege todos los paths
router.use(authenticate);

/**
 * @openapi
 * /api/requests:
 * get:
 * summary: Obtener todas las solicitudes de firma
 * description: Retorna la lista de solicitudes vinculadas a la empresa del usuario logueado.
 * tags: [Requests]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Listado obtenido con éxito.
 */
router.get('/', requestController.getAllRequests);

/**
 * @openapi
 * /api/requests:
 * post:
 * summary: Crear una nueva solicitud de firma
 * description: Inicia un proceso de firma para una acción específica (ej. CREATE_WIRE).
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
 * - accion
 * - descripcion
 * properties:
 * accion:
 * type: string
 * enum: [CREATE_WIRE, APPROVE_WIRE, REQUEST_LOAN, MODIFY_CONTACT_INFO]
 * descripcion:
 * type: string
 * responses:
 * 201:
 * description: Solicitud creada exitosamente.
 */
router.post('/', authenticate, isAdmin, requestController.createRequest);

/**
 * @openapi
 * /api/requests/{requestId}/sign:
 * post:
 * summary: Firmar una solicitud existente
 * description: Registra la firma del usuario actual. Si se cumplen las reglas, el estado cambia a 'COMPLETED'.
 * tags: [Requests]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: requestId
 * required: true
 * schema:
 * type: string
 * format: uuid
 * description: ID único (UUID) de la solicitud.
 * responses:
 * 200:
 * description: Firma registrada.
 * 403:
 * description: El usuario no tiene permisos para esta empresa.
 */
router.post('/:requestId/sign', requestController.signRequest);

module.exports = router;