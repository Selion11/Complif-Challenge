const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Company, User } = require('../models');

describe('Status Endpoints', () => {
    let token;
    const testCuit = "30999999999";

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        
        // Reemplaza en el setup (línea 13 aprox):
        await Company.create({
            cuit: testCuit,
            name: 'Test Corp', // Cambiado 'nombre' por 'name'
            country: 'Argentina',
            industry: 'Retail'
        });

        await User.create({
            username: 'admin_status',
            password: 'password123',
            role: 'admin',
            cuit_empresa: testCuit
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin_status', password: 'password123' });
        
        token = loginRes.body.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debería actualizar el estado (200)', async () => {
        const res = await request(app)
            .patch(`/api/companies/${testCuit}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                status: 'APPROVED', 
                comment: 'Validación de test exitosa' // <--- CAMBIADO DE 'comentario' A 'comment'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});