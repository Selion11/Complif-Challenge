const { Company, Document, StatusHistory } = require('../models'); 
const riskService = require('../services/riskCalculator.service');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const axios = require('axios');


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

        try {
            const response = await axios.post('http://cuit-validator:3001/validate-cuit', { cuit });
            if (!response.data.valid) {
                throw new Error('Validación externa de CUIT fallida');
            }
        } catch (error) {
            const err = new Error('El CUIT no pudo ser validado externamente');
            err.statusCode = 400;
            throw err;
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

        await StatusHistory.create({
            cuit_empresa: cuit,
            estado_anterior: null,
            estado_nuevo: initialStatus,
            usuario_id: req.user.id,
            comentario: 'Registro inicial de la empresa'
        })

        if (req.files) {
            const documentEntries = [];
            for (const field in req.files) {
                const file = req.files[field][0];
                documentEntries.push({
                    tipo: field,
                    ruta_archivo: file.path,
                    cuit_empresa: cuit
                });
            }
            await Document.bulkCreate(documentEntries);
        }

        logger.info({
            event: 'COMPANY_CREATED', // Evento claro para el "webhook" mock
            service: 'CompanyController',
            message: `Nueva empresa registrada: ${nombre}`,
            cuit: cuit,
            actor: req.user.id, // Quién disparó la creación
            riskScore: score,
            status: initialStatus
        });

        res.status(201).json({
            success: true,
            message: requiresManualReview ? "Registro recibido. Requiere revisión." : "Aprobado automáticamente.",
            data: {
                company: company,
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

const listDocuments = async (req, res, next) => {
    try {
        const { cuit } = req.params;

        const documents = await Document.findAll({
            where: { cuit_empresa: cuit }
        });

        res.status(200).json({
            success: true,
            cuit,
            total: documents.length,
            documents: documents,
            message: documents.length > 0 ? "Documentos encontrados." : "Sin documentos cargados."
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

        for (const field in files) {
            const file = files[field][0];
            await Document.upsert({
                tipo: field,
                ruta_archivo: file.path,
                cuit_empresa: cuit
            });
        }

        const currentDocs = await Document.findAll({ where: { cuit_empresa: cuit } });
        const requiredTypes = ['certificadoFiscal', 'constanciaInscripcion', 'polizaSeguro'];
        const isComplete = requiredTypes.every(type => currentDocs.some(d => d.tipo === type));

        const score = riskService.calculateRiskScore({
            pais: companyData.pais, 
            industria: companyData.industria,
            hasDocuments: isComplete
        }, 'CompanyController');

        await companyData.update({ riskScore: score });

        logger.info({
            event: 'DOCUMENT_UPLOADED',
            service: 'CompanyController',
            message: `Documentación actualizada para CUIT ${cuit}`,
            cuit: cuit,
            actor: req.user.id,
            newRiskScore: score,
            isComplete: isComplete
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
            attributes: ['cuit', 'nombre', 'riskScore', 'updatedAt']
        });

        if (!company) {
            const error = new Error(`No se encontró ninguna empresa con el CUIT: ${cuit}`);
            error.statusCode = 404;
            throw error;
        }

        const score = company.riskScore;
        const requiresManualReview = score >= 70;

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
        const company = await Company.findByPk(cuit, {
            include: [{ model: Document, as: 'documentos' }] 
        });

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
        const { status, comentario } = req.body; 

        const company = await Company.findByPk(cuit);
        if (!company) {
            const error = new Error('Empresa no encontrada');
            error.statusCode = 404;
            throw error;
        }

        const oldStatus = company.status;

        await company.update({ status });

        await StatusHistory.create({
            cuit_empresa: cuit,
            estado_anterior: oldStatus,
            estado_nuevo: status,
            usuario_id: req.user.id,
            comentario: comentario || 'Cambio de estado manual'
        });

        logger.info({
            event: 'STATUS_UPDATED',
            service: 'StatusService',
            message: `Cambio de estado para ${cuit}`,
            cuit: cuit,
            actor: req.user.id,
            oldStatus: oldStatus,
            newStatus: status
        });

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
        const { nombre, pais, industria, status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        
        if (nombre) where.nombre = { [Op.iLike]: `%${nombre}%` }; 
        if (pais) where.pais = { [Op.iLike]: `%${pais}%` }; 
        if (industria) where.industria = { [Op.iLike]: `%${industria}%` };
        
        if (status) where.status = status; 

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