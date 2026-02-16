require('dotenv').config(); 

const sequelize = require('./config/database');
const { Company } = require('./models'); 
const logger = require('./utils/logger');
const seedData = require('./seeders/company.seeder');
const app = require('./app'); 

const port = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // 1. Sincronizar Base de Datos
    await sequelize.sync({ alter: true });
    logger.info({ service: 'Database', message: 'Tablas sincronizadas correctamente en PostgreSQL' });

    // 2. Ejecutar Seed Forzado
    logger.info({ service: 'Database', message: 'Iniciando Seed forzado...' });
    await seedData();
    
    // CONTEO DE VERIFICACIÓN
    const finalCount = await Company.count();
    logger.info({ 
      service: 'Database', 
      message: `Seed finalizado con éxito. Total de empresas en DB: ${finalCount}` 
    });

    // 3. Arrancar Servidor
    app.listen(port, () => {
      logger.info({ 
        service: 'System', 
        message: `Servidor corriendo en el puerto ${port} en entorno ${process.env.NODE_ENV}` 
      });
    });

  } catch (err) {
    logger.error({ service: 'Database', message: 'Error crítico en el arranque', error: err.message });
    process.exit(1);
  }
};

startServer();