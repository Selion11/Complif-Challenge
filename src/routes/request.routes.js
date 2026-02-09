const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

router.post('/', requestController.createRequest);
router.post('/:requestId/sign', requestController.signRequest);

module.exports = router;