const express = require('express');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const logger = require('./utils/logger');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Rutas
const companyRoutes = require('./routes/company.routes');
const systemRoutes = require('./routes/system.routes');
const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const ruleRoutes = require('./routes/rule.routes');
const requestRoutes = require('./routes/request.routes'); 

const app = express();

// Configuración de Swagger (puedes mover esto aquí para limpiar el server.js)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Corporate Compliance API',
      version: '1.0.0',
      description: 'API para gestión de onboarding y firmas electrónicas',
    },
    servers: [{ url: 'http://localhost:8080' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], 
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

// DOCS: Swagger UI (Debe ir antes de las rutas 404)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// PUBLIC ROUTES
app.use('/health', systemRoutes);
app.use('/api/auth', authRoutes);

// PROTECTED ROUTES
app.use('/api/companies', authenticate, companyRoutes);
app.use('/api/groups', authenticate, groupRoutes);
app.use('/api/rules', authenticate, ruleRoutes);
app.use('/api/requests', authenticate, requestRoutes);

// ERROR 404
app.use((req, res, next) => {
  const error = new Error(`La ruta ${req.originalUrl} no existe.`);
  error.statusCode = 404;
  next(error);
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;