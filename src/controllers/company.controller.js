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