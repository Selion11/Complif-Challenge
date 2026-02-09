const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { Company, User, StatusHistory } = require('../models');
const jwt = require('jsonwebtoken');

describe('Status & Traceability Endpoints', () => {
    let token;
    let testCuit = "30999999999";

    beforeAll(async () => {
        await sequelize.sync({ force: true });
        const admin = await User.create({
            username: 'admin_status',
            password: 'password123',
            role: 'admin'
        });
        token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret');
        
        await Company.create({
            cuit: testCuit,
            nombre: 'Traceability Corp',
            pais: 'Argentina',
            industria: 'Servicios',
            status: 'PENDING_REVIEW'
        });
    });

    it('Debería actualizar el estado y crear una entrada en StatusHistory (4.73)', async () => {
        const res = await request(app)
            .patch(`/api/companies/${testCuit}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'APPROVED', comentario: 'Documentación validada' });

        expect(res.statusCode).toEqual(200);
        
        // Verificamos que se creó el historial
        const history = await StatusHistory.findOne({ where: { cuit_empresa: testCuit } });
        expect(history).toBeDefined();
        expect(history.estado_nuevo).toBe('APPROVED');
    });
});