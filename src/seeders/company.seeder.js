const { Company, User } = require('../models');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    // 1. Limpiar datos previos si es necesario (Opcional)
    await Company.destroy({ where: {}, truncate: true, cascade: true });

    const companies = [
      { cuit: "30111111118", nombre: "Tech Argentina S.A.", pais: "Argentina", industria: "Tecnología", riskScore: 0, status: 'AUTO_APPROVED' },
      { cuit: "30222222228", nombre: "Constructora Caimán", pais: "Islas Caimán", industria: "Construcción", riskScore: 90, status: 'PENDING_REVIEW' },
      { cuit: "30333333338", nombre: "Finanzas Panamá", pais: "Panamá", industria: "Finanzas", riskScore: 70, status: 'PENDING_REVIEW' },
      { cuit: "30444444448", nombre: "Casino Virtual S.A.", pais: "Uruguay", industria: "Casinos", riskScore: 70, status: 'PENDING_REVIEW' },
      { cuit: "30555555558", nombre: "Seguridad Global", pais: "Chile", industria: "Seguridad", riskScore: 70, status: 'PENDING_REVIEW' },
      { cuit: "30666666668", nombre: "Alimentos Mendoza", pais: "Argentina", industria: "Alimenticia", riskScore: 0, status: 'AUTO_APPROVED' },
      { cuit: "30777777778", nombre: "Exportadora Bahía", pais: "Bahamas", industria: "Logística", riskScore: 70, status: 'PENDING_REVIEW' },
      { cuit: "30888888888", nombre: "Cambio Exacto", pais: "Paraguay", industria: "Casas de cambio", riskScore: 70, status: 'PENDING_REVIEW' }, 
    ];

    for (let i = 9; i <= 20; i++) {
      companies.push({
        cuit: `309999999${i}`,
        nombre: `Empresa Genérica ${i}`,
        pais: i % 2 === 0 ? "España" : "México",
        industria: "Servicios",
        riskScore: 0,
        status: 'AUTO_APPROVED'
      });
    }

    await Company.bulkCreate(companies);
    logger.info({ service: 'Seeder', message: 'Se cargaron 20 empresas de ejemplo exitosamente' });

  } catch (error) {
    logger.error({ service: 'Seeder', message: `Error en el seed: ${error.message}` });
  }
};

module.exports = seedData;