const logger = require('../utils/logger');

const HIGH_RISK_INDUSTRIES = ['construcción', 'seguridad', 'casas de cambio', 'casinos'];

const HIGH_RISK_COUNTRIES = ['Islas Caimán', 'Panamá', 'Bahamas']; 

const calculateRiskScore = (data,origin='RiskService') => {
    try{
         let score = 0;

        if (HIGH_RISK_COUNTRIES.includes(data.pais)) {
            score = 70;
        }

        if (HIGH_RISK_INDUSTRIES.includes(data.industria?.toLowerCase()) && score < 70) {
            score = 70; 
        }

        if (!data.hasDocuments) {
            score += 20; 
        }
        logger.info({
            message: `Score calculado: ${score}`,
            service: origin
        });
        return score;
    }catch(error){
        logger.error({
            message: `Fallo en cálculo: ${error.message}`,
            service: origin
        });
        throw error;
    }
   
};

module.exports = { calculateRiskScore };