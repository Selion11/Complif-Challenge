const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const { SignatureRequest, Rule, Group, User, Company } = require('../models');
const jwt = require('jsonwebtoken');

describe('Signature Engine Logic', () => {
    let token;
    let requestId;
    const testCuit = '30111111118';

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        await Company.create({
            cuit: testCuit,
            name: 'Firma S.A.', // Cambiado 'nombre' por 'name'
            country: 'Argentina',
            industry: 'Servicios'
        });

        const groupA = await Group.create({ 
            nombre: 'Grupo A', 
            cuit_empresa: testCuit 
        });

        const userA = await User.create({ 
            username: 'signerA', 
            password: 'password123',
            role: 'admin',
            cuit_empresa: testCuit
        });

        // Usamos el helper de Sequelize para la tabla intermedia UserGroups
        await userA.addGroup(groupA);

        await Rule.create({
            nombre_regla: 'REQUEST_LOAN', 
            id_grupo: groupA.id,          
            cantidad_requerida: 1,
            cuit_empresa: testCuit
        });

        // Importante: Incluimos el 'cuit' en el token porque el controlador lo usa (req.user.cuit)
        token = jwt.sign(
            { id: userA.id, role: 'admin', cuit: testCuit }, 
            process.env.JWT_SECRET || 'secret'
        );
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Debería crear una solicitud de firma y completarla con 1 firma', async () => {
        // 1. Crear Solicitud
        const createRes = await request(app)
            .post('/api/requests')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                accion: 'REQUEST_LOAN', 
                descripcion: 'Préstamo Expansión' 
            });

        expect(createRes.statusCode).toEqual(201);
        // Según tu controlador: res.status(201).json({ success: true, data: request });
        requestId = createRes.body.data.id;

        // 2. Firmar Solicitud
        const signRes = await request(app)
            .post(`/api/requests/${requestId}/sign`)
            .set('Authorization', `Bearer ${token}`);

        expect(signRes.statusCode).toEqual(200);
        expect(signRes.body.estado).toBe('COMPLETED');
    });
});