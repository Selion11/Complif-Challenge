const request = require('supertest');
const app = require('../app');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Company } = require('../models');

jest.mock('axios'); // Mockeamos el validador externo

describe('Company Management', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret');
    });

    it('Debería filtrar empresas por país correctamente (Paginación)', async () => {
        const res = await request(app)
            .get('/api/companies?pais=Argentina&page=1&limit=5')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.pagination).toBeDefined();
    });

    it('Debería fallar la creación si el CUIT es rechazado por el microservicio', async () => {
        axios.post.mockResolvedValue({ data: { valid: false } });

        const res = await request(app)
            .post('/api/companies/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Fail Co', cuit: '123', pais: 'Arg', industria: 'Tech' });

        expect(res.statusCode).toEqual(400);
    });
});