const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /health:
 * get:
 * summary: Estado del sistema
 * description: Retorna el estado de salud de la API.
 * responses:
 * 200:
 * description: El sistema está operativo.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * example: "UP"
 */
router.get('/', (req, res) => res.json({ status: 'UP' }));

module.exports = router;