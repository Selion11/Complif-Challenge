const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @openapi
 * tags:
 * name: Auth
 * description: Gestión de usuarios y sesiones
 */

/**
 * @openapi
 * /api/auth/signup:
 * post:
 * summary: Registrar un nuevo usuario
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - password
 * - cuit_empresa
 * properties:
 * username:
 * type: string
 * example: admin_test
 * password:
 * type: string
 * example: password123
 * cuit_empresa:
 * type: string
 * example: "30111111118"
 * role:
 * type: string
 * enum: [admin, viewer]
 * default: viewer
 * responses:
 * 201:
 * description: Usuario creado con éxito
 * 400:
 * description: Error en la validación de datos
 */
router.post('/signup', authController.signup);

/**
 * @openapi
 * /api/auth/login:
 * post:
 * summary: Iniciar sesión
 * description: Devuelve un token JWT necesario para acceder a las rutas protegidas
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - password
 * properties:
 * username:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login exitoso, devuelve el token JWT
 * 401:
 * description: Credenciales inválidas
 */
router.post('/login', authController.login);

module.exports = router;