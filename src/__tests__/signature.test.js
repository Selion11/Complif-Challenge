const request = require('supertest');
const app = require('../app');
const { SignatureRequest, Rule, Group, User } = require('../models');
const jwt = require('jsonwebtoken');

describe('Signature Engine (Part 1 Logic)', () => {
    let token;
    let requestId;

    beforeAll(async () => {
        const groupA = await Group.create({ nombre: 'Grupo A' });
        const userA = await User.create({ username: 'signerA', role: 'admin' });
        await userA.addGroup(groupA);

        await Rule.create({
            facultad: 'REQUEST_LOAN',
            grupo_id: groupA.id,
            cantidad_requerida: 1
        });

        token = jwt.sign({ id: userA.id, role: 'admin' }, process.env.JWT_SECRET || 'secret');
    });

    it('Debería crear una solicitud de firma para la facultad REQUEST_LOAN', async () => {
        const res = await request(app)
            .post('/api/signatures/request')
            .set('Authorization', `Bearer ${token}`)
            .send({ facultad: 'REQUEST_LOAN', cuit_empresa: '30111111118' });

        expect(res.statusCode).toEqual(201);
        requestId = res.body.data.id;
    });

    it('Debería aprobar la solicitud cuando firma el usuario del Grupo A', async () => {
        const res = await request(app)
            .post(`/api/signatures/${requestId}/sign`)
            .set('Authorization', `Bearer ${token}`);

        // Al ser 1 de A, el estado debería pasar a COMPLETED
        expect(res.body.data.estado).toBe('COMPLETED');
    });
});