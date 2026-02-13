const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { User, Company } = require('../models'); // AGREGADO: Importamos Company

describe('Auth & Role Access', () => {
    beforeAll(async () => {
        // Sincronizamos la base de datos de prueba
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debería denegar el acceso a rutas protegidas sin token (401)', async () => {
        const res = await request(app).get('/api/companies');
        expect(res.statusCode).toEqual(401);
    });

    it('Debería permitir el login y devolver un token JWT (200)', async () => {
        // 1. Crear primero la empresa (Integridad Referencial)
        await Company.create({
            cuit: '30000000001',
            nombre: 'Test Co',
            pais: 'Argentina',
            industria: 'Tech'
        });

        // 2. Crear el usuario vinculado a esa empresa
        // Importante: Asegúrate de que tu modelo User use bcrypt en un hook 'beforeCreate'
        await User.create({
            username: 'admin_test',
            password: 'password123', 
            role: 'admin',
            cuit_empresa: '30000000001'
        });

        // 3. Intentar el login
        const res = await request(app)
            .post('/api/auth/login')
            .send({ 
                username: 'admin_test', 
                password: 'password123' 
            });

        // Verificaciones
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
    });
});