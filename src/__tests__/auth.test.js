const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { User } = require('../models');

describe('Auth & Role Access', () => {
    beforeAll(async () => {
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
        await User.create({
            username: 'admin_test',
            password: 'password123',
            role: 'admin',
            cuit_empresa: '30000000001'
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin_test', password: 'password123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});