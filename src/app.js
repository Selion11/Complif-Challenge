const express = require('express');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const cors = require('cors');
const logger = require('./utils/logger');
const path = require('path')


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
    console.error('Swagger Load Error (Bypass):', err.message);
}

// MIDDLEWARES
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'Origin', 
        'X-Requested-With'
    ],
    credentials: true,
    maxAge: 86400 
}));

app.options('*', cors())

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
    logger.info(`HTTP ${req.method} ${req.url}`);
    next();
});

if (swaggerSpec) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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