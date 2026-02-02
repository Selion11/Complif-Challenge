const fs = require('fs'); 
const path = require('path');
const Company = require('../models/company.model'); 
const riskService = require('../services/riskCalculator.service');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const createCompany = async (req, res, next) => { 
    console.log("===> PETICIÓN RECIBIDA EN CREATECOMPANY");
    try {
        const { nombre, cuit, pais, industria } = req.body;
        
        const requiredFields = ['nombre', 'cuit', 'pais', 'industria'];
        const missingField = requiredFields.find(field => !req.body[field]);
        if (missingField) {
            const error = new Error(`El campo '${missingField}' es obligatorio`);
            error.statusCode = 400;
            throw error;
        }

        const docs = req.files || {};
        const checkDocs = {
            certificadoFiscal: !!(docs.certificadoFiscal && docs.certificadoFiscal.length > 0),
            constanciaInscripcion: !!(docs.constanciaInscripcion && docs.constanciaInscripcion.length > 0),
            polizaSeguro: !!(docs.polizaSeguro && docs.polizaSeguro.length > 0)
        };

        const missingDocs = Object.keys(checkDocs).filter(key => !checkDocs[key]);
        const isComplete = missingDocs.length === 0;

        const score = riskService.calculateRiskScore({
            pais,
            industria,
            hasDocuments: isComplete 
        }, 'CompanyController');

        const requiresManualReview = score >= 70;
        const initialStatus = requiresManualReview ? 'PENDING_REVIEW' : 'AUTO_APPROVED';


        const existingCompany = await Company.findByPk(cuit);

        if (existingCompany) {
            const error = new Error(`Ya existe una empresa registrada con el CUIT: ${cuit}`);
            error.statusCode = 409;
            throw error;
        }

        const company = await Company.create({
            cuit,
            nombre,
            pais,
            industria,
            riskScore: score,
            status: initialStatus
        });

        logger.info({
            service: 'CompanyController',
            message: `Nueva empresa registrada: ${nombre} (CUIT: ${cuit})`,
            cuit
        });

        res.status(201).json({
            success: true,
            message: requiresManualReview ? "Registro recibido. Requiere revisión." : "Aprobado automáticamente.",
            data: {
                company: { nombre, cuit, pais, industria },
                riskAnalysis: {
                    score,
                    status: initialStatus,
                    isComplete,
                    missingDocuments: missingDocs
                }
            }
        });

    } catch (error) {
        console.error("===> ERROR EN CREATECOMPANY:", error);
        next(error);
    }
};

const listDocuments = (req, res, next) => {
    try {
        const { cuit } = req.params;
        const folderPath = path.join('uploads', cuit);

        if (!fs.existsSync(folderPath)) {
            return res.status(200).json({
                success: true,
                cuit,
                documents: [],
                message: "Sin documentos cargados."
            });
        }

        const files = fs.readdirSync(folderPath); 

        res.status(200).json({
            success: true,
            cuit,
            total: files.length,
            documents: files
        });
    } catch (error) {
        next(error);
    }
};

const updateSingleDocument = async (req, res, next) => { 
    try {
        const { cuit } = req.params;
        const files = req.files || {};

        if (Object.keys(files).length === 0) {
            const error = new Error('No se recibió archivo');
            error.statusCode = 400;
            throw error;
        }

        const companyData = await Company.findByPk(cuit);
        if (!companyData) {
            const error = new Error('Empresa no encontrada en la base de datos');
            error.statusCode = 404;
            throw error;
        }

        const uploadPath = path.join('uploads', cuit);
        const existingFiles = fs.existsSync(uploadPath) ? fs.readdirSync(uploadPath) : [];

        const isComplete = ['certificadoFiscal', 'constanciaInscripcion', 'polizaSeguro'].every(name => 
            existingFiles.some(f => f.startsWith(name))
        );

        const score = riskService.calculateRiskScore({
            pais: companyData.pais, 
            industria: companyData.industria,
            hasDocuments: isComplete
        }, 'CompanyController');

        await companyData.update({ riskScore: score });

        logger.info({
            service: 'CompanyController',
            message: `Doc actualizado. CUIT ${cuit}. Nuevo Score: ${score}`
        });

        res.status(200).json({
            success: true,
            data: { cuit, newRiskScore: score, isComplete }
        });
    } catch (error) {
        next(error);
    }
};

const getRiskScore = async (req,res,next) => {
    try {
        const { cuit } = req.params;

        const company = await Company.findByPk(cuit, {
            attributes: ['cuit', 'nombre', 'riskScore', 'updatedAt'] // Solo traemos lo necesario
        });

        if (!company) {
            const error = new Error(`No se encontró ninguna empresa con el CUIT: ${cuit}`);
            error.statusCode = 404;
            throw error;
        }

        const score = company.riskScore;
        const requiresManualReview = score > 70;

        logger.info({
            service: 'CompanyController',
            message: `Consulta de Risk Score para CUIT ${cuit}: ${score}`,
            cuit
        });

        res.status(200).json({
            success: true,
            data: {
                cuit: company.cuit,
                nombre: company.nombre,
                riskScore: score,
                status: requiresManualReview ? 'PENDING_REVIEW' : 'AUTO_APPROVED',
                lastUpdate: company.updatedAt
            }
        });

    } catch (error) {
        next(error);
    }
}

const getCompanyDetail = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const company = await Company.findByPk(cuit);

        if (!company) {
            const error = new Error('Empresa no encontrada');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const { status } = req.body; 

        const company = await Company.findByPk(cuit);
        if (!company) {
            const error = new Error('Empresa no encontrada');
            error.statusCode = 404;
            throw error;
        }

        await company.update({ status });

        res.status(200).json({
            success: true,
            message: `Estado actualizado a ${status}`,
            data: company
        });
    } catch (error) {
        next(error);
    }
};

const listCompanies = async (req, res, next) => {
    try {
        const { pais, industria, page = 1, limit = 10 } = req.query;
        
        const offset = (page - 1) * limit;

        const where = {};
        if (pais) where.pais = { [Op.iLike]: `%${pais}%` }; 
        if (industria) where.industria = { [Op.iLike]: `%${industria}%` };

        const { count, rows } = await Company.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit)
            },
            data: rows
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { 
    createCompany, 
    listDocuments, 
    updateSingleDocument,
    getRiskScore,
    getCompanyDetail,
    updateStatus,
    listCompanies
};