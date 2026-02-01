const express = require('express');
const router = express.Router();

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
    res.status(503).json(healthcheck);
  }
});

module.exports = router;