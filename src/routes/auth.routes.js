const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Integración de validación de entradas
const validate = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('../validations/auth.validation');

/**
 * @openapi
 * tags:
 * name: Auth
 * description: Gestión de usuarios y sesiones de acceso
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
 * description: Error de validación o datos malformados
 */
router.post('/signup', validate(signupSchema), authController.signup);

/**
 * @openapi
 * /api/auth/login:
 * post:
 * summary: Iniciar sesión
 * description: Autentica credenciales y devuelve un token JWT con rol y CUIT.
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
 * 400:
 * description: Error de validación en los campos requeridos
 */
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;