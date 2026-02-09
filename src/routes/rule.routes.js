const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/rule.controller');

router.post('/', ruleController.createRule);
router.get('/', ruleController.getRulesByCompany);

module.exports = router;