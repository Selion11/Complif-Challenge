require('dotenv').config(); 

const sequelize = require('./config/database');
const { Company } = require('./models'); 
const logger = require('./utils/logger');
const seedData = require('./seeders/company.seeder');
const app = require('./app'); 

const port = process.env.PORT || 8080;

sequelize.sync({ alter: true }) 
  .then(async () => {
    logger.info({ service: 'Database', message: 'Tablas sincronizadas correctamente en PostgreSQL' });

    const count = await Company.count();
    if (count === 0) {
      logger.info({ service: 'Database', message: 'Base de datos vacía. Iniciando Seed...' });
      await seedData();
    }

    app.listen(port, () => {
      logger.info({ 
        service: 'System', 
        message: `Servidor corriendo en el puerto ${port} en entorno ${process.env.NODE_ENV}` 
      });
    });
  })
  .catch((err) => {
    logger.error({ service: 'Database', message: 'Error crítico en el arranque', error: err.message });
    process.exit(1); 
  });