const request = require('supertest');
const app = require('../app');
const { Company, User } = require('../models');
const sequelize = require('../config/database');

describe('Company Management', () => {
    let adminToken;
    const adminCuit = '30000000001';

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        
        await Company.create({
            cuit: adminCuit,
            name: 'Admin Corp',
            country: 'Argentina',
            industry: 'Tecnologia'
        });

        await User.create({
            username: 'admin_company_test',
            password: 'password123',
            role: 'admin',
            cuit_empresa: adminCuit
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin_company_test', password: 'password123' });
        
        adminToken = loginRes.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debería permitir crear una empresa con datos válidos (201)', async () => {
        const res = await request(app)
            .post('/api/companies/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Nueva Empresa S.A.',
                cuit: '30111111118',
                country: 'Argentina', 
                industry: 'Agro'
            });

        if (res.statusCode === 400) {
            console.log("DEBUG VALIDATION FAIL:", JSON.stringify(res.body.errors, null, 2));
        }
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('Debería rechazar la creación de una empresa duplicada (409)', async () => {
        const res = await request(app)
            .post('/api/companies/create')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Admin Corp',
                cuit: adminCuit,
                country: 'Argentina',
                industry: 'Tecnologia'
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
    });
});