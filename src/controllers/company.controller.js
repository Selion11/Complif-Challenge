const fs = require('fs'); 
const path = require('path');

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

        const requiresManualReview = score > 70;
        
        logger.info({
            service: 'CompanyController',
            message: `Empresa ${nombre} (CUIT: ${cuit}) procesada. Score: ${score}`,
            cuit: cuit,
            score: score
        });

        res.status(201).json({
            success: true,
            message: requiresManualReview 
                ? "Registro recibido. Requiere revisión de analista." 
                : "Registro aprobado automáticamente.",
            data: {
                company: { nombre, cuit, pais, industria },
                riskAnalysis: {
                    score,
                    status: requiresManualReview ? 'PENDING_REVIEW' : 'AUTO_APPROVED',
                    isComplete,
                    missingDocuments: missingDocs
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

const listDocuments = (req,res,next) => {
    try{
        const {cuit} = req.params;
        const folderPath = path.join('uploads',cuit);

        if(!fs.existsSync(folderPath)) {
            logger.info({
                service: 'CompanyController',
                message: `Consulta de documentos: Carpeta no encontrada para CUIT ${cuit}`,
                cuit
            });

            return res.status(200).json({
                success: true,
                cuit,
                document: [],
                message: "Esta empresa aún no tiene documentos cargados."
            })
        }

        const files = fs.readdirSync(uploadPath);

        logger.info({
            service: 'CompanyController',
            message: `Documentos listados para CUIT ${cuit}. Total: ${files.length}`,
            cuit
        });

        res.status(200).json({
            success: true,
            cuit,
            total: files.length,
            documents: files
        })

    } catch (error) {
        next(error);
    }
};

const updateSingleDocument = (req,res,next) => {
    try{
        const {cuit} = req.params;
        const files = req.files || {};

        if (Object.keys(files).length === 0) {
            const error = new Error('No se recibió ningún archivo para actualizar');
            error.statusCode = 400;
            throw error;
        }

        const uploadPath = path.join('uploads', cuit);
        const existingFiles = fs.existsSync(uploadPath) ? fs.readdirSync(uploadPath) : [];

        const tieneCertificado = existingFiles.some(f => f.startsWith('certificadoFiscal'));
        const tieneConstancia = existingFiles.some(f => f.startsWith('constanciaInscripcion'));
        const tienePoliza = existingFiles.some(f => f.startsWith('polizaSeguro'));

        const isComplete = tieneCertificado && tieneConstancia && tienePoliza;

        const score = riskService.calculateRiskScore({
            pais: req.body.pais || "Desconocido", 
            industria: req.body.industria || "Desconocida",
            hasDocuments: isComplete
        }, 'CompanyController');

        logger.info({
            service: 'CompanyController',
            message: `Documento actualizado para CUIT ${cuit}. Nuevo Score: ${score}`,
            cuit
        });

        res.status(200).json({
            success: true,
            message: "Documento actualizado correctamente y score recalculado",
            data: {
                cuit,
                newRiskScore: score,
                isComplete,
                updatedFields: Object.keys(files)
            }
        });
    } catch (error) {

    }
}

module.exports = {
    createCompany,
    listDocuments,
    updateSingleDocument
};