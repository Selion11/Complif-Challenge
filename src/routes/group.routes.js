const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

/**
 * @openapi
 * tags:
 * name: Groups
 * description: Configuración de grupos de firmantes y asignación de usuarios
 */
router.use(authenticate);

/**
 * @openapi
 * /api/groups:
 * post:
 * summary: Crear un nuevo grupo de firmantes
 * description: Define una agrupación lógica (ej. Directores, Apoderados) para ser utilizada en reglas de firma.
 * tags: [Groups]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * properties:
 * name:
 * type: string
 * example: "Grupo A - Firmantes Tipo A"
 * description:
 * type: string
 * example: "Directores con facultades de firma conjunta"
 * responses:
 * 201:
 * description: Grupo creado exitosamente.
 * 403:
 * description: Acceso denegado. Se requieren permisos de administrador.
 */
router.post('/',isAdmin, groupController.createGroup);

/**
 * @openapi
 * /api/groups/add-user:
 * post:
 * summary: Asignar un usuario a un grupo
 * description: Vincula a un usuario con un grupo específico para que herede sus facultades de firma.
 * tags: [Groups]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * - groupId
 * properties:
 * userId:
 * type: integer
 * example: 5
 * groupId:
 * type: integer
 * example: 2
 * responses:
 * 200:
 * description: Usuario asignado al grupo correctamente.
 * 404:
 * description: Usuario o Grupo no encontrado.
 */
router.post('/add-user',isAdmin, groupController.addUserToGroup);

module.exports = router;