require('dotenv').config(); 

const sequelize = require('./config/database');
const Company = require('./models/company.model');
const logger = require('./utils/logger');

const app = require('./app'); 

const port = process.env.PORT || 8080;

app.listen(port, () => {
  logger.info({ 
    service: 'System', 
    message: `Servidor corriendo en el puerto ${port} en entorno ${process.env.NODE_ENV}` 
  });
});

sequelize.sync({ alter: true }) // 'alter' actualiza las tablas si cambias el modelo
  .then(() => {
    logger.info({ service: 'Database', message: 'Tablas sincronizadas correctamente en PostgreSQL' });
  })
  .catch((err) => {
    logger.error({ service: 'Database', message: 'Error sincronizando tablas', error: err.message });
  });