const express = require('express');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const logger = require('./utils/logger');

// 1. CARGA DE MODELOS Y RELACIONES
// Importar el index dispara la ejecución de asociaciones en models.relations.js
require('./models'); 

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

// 2. CONFIGURACIÓN DE SWAGGER PROTEGIDA
// Solo intentamos cargar Swagger si no hay errores semánticos en los YAML de las rutas.
let swaggerSpec = null;
try {
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Corporate Compliance API',
                version: '1.0.0',
                description: 'API para gestión de onboarding y firmas electrónicas',
            },
            servers: [{ url: 'http://localhost:8080' }],
            tags: [
                { name: 'Auth', description: 'Acceso y Usuarios' },
                { name: 'Companies', description: 'Gestión de Empresas' },
                { name: 'Governance', description: 'Grupos y Reglas' },
                { name: 'Requests', description: 'Procesos de Firma' }
            ],
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
        apis: [], 
    };
    swaggerSpec = swaggerJsdoc(swaggerOptions);
} catch (err) {
    // Si Swagger falla por claves duplicadas en los comentarios, el servidor no se cae
    console.error('Swagger Load Error (Bypass):', err.message);
}

// MIDDLEWARES
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.url}`);
    next();
});

// DOCS: Swagger UI (Solo si el spec es válido)
if (swaggerSpec) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 3. DEFINICIÓN DE RUTAS
app.use('/health', systemRoutes);
app.use('/api/auth', authRoutes);

// Rutas protegidas por el middleware de autenticación
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

// 4. MANEJO GLOBAL DE ERRORES
app.use(errorHandler);

module.exports = app;