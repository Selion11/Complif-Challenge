const riskService = require('../services/riskCalculator.service');
const logger = require('../utils/logger');

const createCompany = (req, res, next) => {
    try {
        const { nombre, cuit, pais, industria } = req.body;
        const requiredFields = ['nombre', 'cuit', 'pais', 'industria'];
        
        const missingField = requiredFields.find(field => !req.body[field]);

        if (missingField) {
            const error = new Error(`El campo '${missingField}' es obligatorio`);
            error.statusCode = 400;
            throw error;
        }
        
        const score = riskService.calculateRiskScore({
            pais,
            industria,
            hasDocuments: false 
        }, 'CompanyController');

        const requiresManualReview = score > 70;

        logger.info({
            service: 'CompanyController',
            message: `Empresa ${nombre} procesada con score ${score}`
        });

        res.status(201).json({
            success: true,
            message: "Datos de empresa recibidos correctamente",
            data: {
                nombre,
                riskScore: score,
                requiresManualReview,
                status: requiresManualReview ? 'Pending Review' : 'Approved'
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createCompany };