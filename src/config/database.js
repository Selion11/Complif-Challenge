const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: (msg) => logger.info({ service: 'Sequelize', message: msg }),
});

module.exports = sequelize;