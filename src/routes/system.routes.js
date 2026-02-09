const express = require('express');
const router = express.Router();

/**
 * @openapi
 * tags:
 * name: System
 * description: Endpoints de monitoreo y estado del servidor
 */

/**
 * @openapi
 * /health:
 * get:
 * summary: Verificar el estado del servicio
 * description: Retorna información sobre la disponibilidad, el tiempo de actividad (uptime) y la versión actual de la API.
 * tags: [System]
 * responses:
 * 200:
 * description: El servicio está operativo.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * status:
 * type: string
 * example: UP
 * uptime:
 * type: number
 * example: 124.55
 * message:
 * type: string
 * example: OK
 * timestamp:
 * type: string
 * format: date-time
 * version:
 * type: string
 * example: 1.0.0
 * 503:
 * description: El servicio no está disponible o presenta errores internos.
 */
router.get('/', (req, res) => {
  const healthcheck = {
    status: 'UP',
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    healthcheck.status = 'DOWN';
    res.status(503).json(healthcheck);
  }
});

module.exports = router;