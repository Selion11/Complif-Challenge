const { Company, Document, StatusHistory, User } = require('../models'); 
const riskService = require('../services/riskCalculator.service');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const axios = require('axios');

const getUsersByCompany = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const users = await User.findAll({ 
            where: { cuit_empresa: cuit },
            attributes: ['id', 'username', 'role'] 
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

/**
 * Crea una nueva empresa y procesa su legajo inicial.
 * Se espera que el validador maneje 'name', 'country' e 'industry'.
 */
const createCompany = async (req, res, next) => { 
    try {
        const { name, cuit, country, industry } = req.body;
        
        const requiredFields = ['name', 'cuit', 'country', 'industry'];
        const missingField = requiredFields.find(field => !req.body[field]);
        if (missingField) {
            const error = new Error(`El campo '${missingField}' es obligatorio`);
            error.statusCode = 400;
            return next(error);
        }

        try {
            const response = await axios.post('http://cuit-validator:3001/validate-cuit', { cuit });
            if (!response.data.valid) {
                const error = new Error('Validación externa de CUIT fallida');
                error.statusCode = 400;
                return next(error);
            }
        } catch (error) {
            const err = new Error('El CUIT no pudo ser validado externamente');
            err.statusCode = 400;
            return next(err);
        }

        const docs = req.files || {};
        const checkDocs = {
            certificadoFiscal: !!(docs.certificadoFiscal && docs.certificadoFiscal.length > 0),
            constanciaInscripcion: !!(docs.constanciaInscripcion && docs.constanciaInscripcion.length > 0),
            polizaSeguro: !!(docs.polizaSeguro && docs.polizaSeguro.length > 0)
        };

        const isComplete = Object.values(checkDocs).every(val => val === true);

        const score = riskService.calculateRiskScore({
            pais: country,
            industria: industry,
            hasDocuments: isComplete 
        }, 'CompanyController');

        const requiresManualReview = score >= 70;
        const initialStatus = requiresManualReview ? 'PENDING_REVIEW' : 'AUTO_APPROVED';

        const existingCompany = await Company.findByPk(cuit);
        if (existingCompany) {
            const error = new Error(`Ya existe una empresa registrada con el CUIT: ${cuit}`);
            error.statusCode = 409;
            return next(error);
        }

        const company = await Company.create({
            cuit,
            name, 
            country: country,
            industry: industry,
            riskScore: score,
            status: initialStatus
        });

        await StatusHistory.create({
            cuit_empresa: cuit,
            estado_anterior: null,
            estado_nuevo: initialStatus,
            usuario_id: req.user?.id || 1,
            comentario: 'Registro inicial de la empresa y creación de legajo'
        });

        if (req.files) {
            const documentEntries = [];
            for (const field in req.files) {
                const fileArray = req.files[field];
                if (fileArray && fileArray.length > 0) {
                    const file = fileArray[0];
                    documentEntries.push({
                        tipo: field,
                        ruta_archivo: file.path,
                        cuit_empresa: cuit
                    });
                }
            }
            if (documentEntries.length > 0) {
                await Document.bulkCreate(documentEntries);
            }
        }

        logger.info({
            event: 'COMPANY_CREATED',
            service: 'CompanyController',
            message: `Nueva empresa registrada: ${name}`,
            cuit: cuit,
            actor: req.user?.id || 'System',
            riskScore: score,
            status: initialStatus
        });

        return res.status(201).json({
            success: true,
            message: requiresManualReview ? "Registro recibido. Requiere revisión." : "Aprobado automáticamente.",
            data: {
                company,
                riskAnalysis: {
                    score,
                    status: initialStatus,
                    isComplete,
                    missingDocuments: Object.keys(checkDocs).filter(k => !checkDocs[k])
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Lista los documentos de una empresa específica.
 */
const listDocuments = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const documents = await Document.findAll({ where: { cuit_empresa: cuit } });

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

/**
 * Actualiza o sube un documento individual.
 */
const updateSingleDocument = async (req, res, next) => { 
    try {
        const { cuit } = req.params; // ✅ Ahora llegará bien gracias a tu cambio en el router [cite: 2026-02-18]
        
        if (!cuit) {
            const error = new Error('El CUIT es necesario en la URL');
            error.statusCode = 400;
            return next(error);
        }

        const files = req.files || {};
        if (Object.keys(files).length === 0) {
            const error = new Error('No se recibió ningún archivo binario');
            error.statusCode = 400;
            return next(error);
        }

        const companyData = await Company.findByPk(cuit);
        if (!companyData) {
            const error = new Error('Empresa no registrada en el sistema');
            error.statusCode = 404;
            return next(error);
        }

        // Procesamos los archivos que Multer dejó en req.files
        for (const field in files) {
            const fileArray = files[field];
            if (fileArray && fileArray.length > 0) {
                const file = fileArray[0];
                await Document.upsert({
                    tipo: field,
                    ruta_archivo: file.path,
                    cuit_empresa: cuit
                });
            }
        }

        // Recalculamos el estado de completitud
        const currentDocs = await Document.findAll({ where: { cuit_empresa: cuit } });
        const requiredTypes = ['certificadoFiscal', 'constanciaInscripcion', 'polizaSeguro'];
        const isComplete = requiredTypes.every(type => currentDocs.some(d => d.tipo === type));

        // ✅ CORRECCIÓN TÉCNICA: industra -> industry
        const score = riskService.calculateRiskScore({
            pais: companyData.country, 
            industria: companyData.industry, // Aseguramos que use la propiedad correcta del modelo
            hasDocuments: isComplete
        }, 'CompanyController');

        await companyData.update({ riskScore: score });

        return res.status(200).json({
            success: true,
            message: 'Documento procesado y score actualizado',
            data: { 
                cuit, 
                newRiskScore: score, 
                isComplete,
                documentos: currentDocs 
            }
        });
    } catch (error) {
        next(error); 
    }
};

/**
 * Obtiene el score de riesgo actual.
 */
const getRiskScore = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const company = await Company.findByPk(cuit, {
            attributes: ['cuit', 'name', 'riskScore', 'updatedAt']
        });

        if (!company) {
            const error = new Error(`No se encontró ninguna empresa con el CUIT: ${cuit}`);
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: {
                cuit: company.cuit,
                name: company.name,
                riskScore: company.riskScore,
                status: company.riskScore >= 70 ? 'PENDING_REVIEW' : 'AUTO_APPROVED',
                lastUpdate: company.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene el detalle completo de una empresa incluyendo documentos.
 */
const getCompanyDetail = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const company = await Company.findByPk(cuit, {
            include: [{ 
                model: Document, 
                as: 'documentos' 
            }] 
        });

        if (!company) {
            const error = new Error('Empresa no encontrada');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};

/**
 * Actualiza manualmente el estado de aprobación.
 */
const updateStatus = async (req, res, next) => {
    try {
        const cuit = req.params.cuit;
        const { status, comment } = req.body; 

        const company = await Company.findByPk(cuit);
        if (!company) {
            const error = new Error('Empresa no encontrada');
            error.statusCode = 404;
            return next(error);
        }

        const oldStatus = company.status;
        await company.update({ status });

        await StatusHistory.create({
            cuit_empresa: cuit,
            estado_anterior: oldStatus,
            estado_nuevo: status,
            usuario_id: req.user?.id || null, 
            comentario: comment || 'Cambio de estado manual'
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

const getStatusHistory = async (req, res, next) => {
    try {
        const { cuit } = req.params;
        const history = await StatusHistory.findAll({
            where: { cuit_empresa: cuit },
            include: [{ model: User, attributes: ['username'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: history });
    } catch (error) { next(error); }
};

/**
 * Lista empresas con filtros opcionales (mapeados a country/industry para la query).
 */
const listCompanies = async (req, res, next) => {
    try {
        const { name, country, industry, status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};
        
        if (name) where.name = { [Op.iLike]: `%${name}%` }; 
        if (country) where.country = { [Op.iLike]: `%${country}%` }; 
        if (industry) where.industry = { [Op.iLike]: `%${industry}%` };
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
    listCompanies,
    getUsersByCompany,
    getStatusHistory
};