const { Company, User } = require('../models');
const { createCompany } = require('../controllers/company.controller');
const logger = require('../utils/logger');

const seedData = async () => {
    try {
        await User.destroy({ where: {}, truncate: true, cascade: true });
        await Company.destroy({ where: {}, truncate: true, cascade: true });

        logger.info({ service: 'Seeder', message: 'Base de datos limpiada.' });

        const firstCompanyCuit = "30111111118";
        
        await Company.create({
            cuit: firstCompanyCuit,
            name: "Tech Argentina S.A.",
            country: "Argentina", 
            industry: "Tecnología", 
            status: 'AUTO_APPROVED'
        });

        const adminUser = await User.create({
            username: 'adminDB',
            password: 'password123',
            role: 'admin',
            cuit_empresa: firstCompanyCuit 
        });

        const adminUuid = adminUser.id;
        logger.info({ service: 'Seeder', message: `Admin 'adminDB' (ID: ${adminUuid}) creado.` });

       
        const companiesToSeed = [
            { cuit: "30222222228", name: "Constructora Caimán", country: "Islas Caimán", industry: "Construcción" },
            { cuit: "30333333338", name: "Finanzas Panamá", country: "Panamá", industry: "Finanzas" },
            { cuit: "30444444448", name: "Casino Virtual S.A.", country: "Uruguay", industry: "Casinos" },
            { cuit: "30555555558", name: "Seguridad Global", country: "Chile", industry: "Seguridad" },
            { cuit: "30666666668", name: "Alimentos Mendoza", country: "Argentina", industry: "Alimenticia" },
            { cuit: "30777777778", name: "Exportadora Bahía", country: "Bahamas", industry: "Logística" },
            { cuit: "30888888888", name: "Cambio Exacto", country: "Paraguay", industry: "Casas de cambio" },
            { cuit: "30999999901", name: "Logística del Sur", country: "Argentina", industry: "Transporte" },
            { cuit: "30999999902", name: "Banca Suiza Express", country: "Suiza", industry: "Finanzas" },
            { cuit: "30999999903", name: "Inversiones Dubái", country: "Emiratos Árabes", industry: "Real Estate" },
            { cuit: "30999999904", name: "Cripto Mining Co", country: "Islandia", industry: "Tecnología" },
            { cuit: "30999999905", name: "Servicios Mineros S.A.", country: "Perú", industry: "Minería" },
            { cuit: "30999999906", name: "Petróleo y Gas", country: "Venezuela", industry: "Energía" },
            { cuit: "30999999907", name: "Desarrollos Tech", country: "Estados Unidos", industry: "Software" },
            { cuit: "30999999908", name: "Importadora del Este", country: "Paraguay", industry: "Comercio" },
            { cuit: "30999999909", name: "Consultora Estratégica", country: "Brasil", industry: "Consultoría" },
            { cuit: "30999999910", name: "Farmacia Central", country: "Argentina", industry: "Salud" },
            { cuit: "30999999911", name: "Turismo Andino", country: "Bolivia", industry: "Turismo" },
            { cuit: "30999999912", name: "E-commerce Global", country: "España", industry: "Retail" },
            { cuit: "30999999913", name: "Agro Industrial", country: "Argentina", industry: "Agricultura" }
        ];

        for (const companyData of companiesToSeed) {
            const req = {
                body: companyData,
                files: {}, 
                user: { id: adminUuid }
            };
            const res = { status: () => ({ json: () => {} }) };
            const next = (err) => { if (err) throw err; };

            await createCompany(req, res, next);
        }

        logger.info({ service: 'Seeder', message: `Seed finalizado exitosamente.` });

    } catch (error) {
        logger.error({ service: 'Seeder', message: `Fallo crítico: ${error.message}` });
        console.error("DETALLE TÉCNICO:", error);
    }
};

module.exports = seedData;