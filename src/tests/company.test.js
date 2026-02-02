const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/database');
const Company = require('../models/company.model');
const fs = require('fs');
const path = require('path');

describe('Company API Endpoints', () => {
  const uploadsPath = path.join(__dirname, '../uploads');

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();

    if (fs.existsSync(uploadsPath)) {
      fs.rmSync(uploadsPath, { recursive: true, force: true });
    }
  });

  describe('POST /api/companies/create', () => {
    it('Debería crear una empresa exitosamente con archivos simulados (201)', async () => {
      const res = await request(app)
        .post('/api/companies/create')
        .field('nombre', 'Empresa Test')
        .field('cuit', '20123456789')
        .field('pais', 'Argentina')
        .field('industria', 'Tecnologia')
        .attach('certificadoFiscal', Buffer.from('%PDF-1.4'), 'test.pdf')
        .attach('constanciaInscripcion', Buffer.from('%PDF-1.4'), 'test.pdf')
        .attach('polizaSeguro', Buffer.from('%PDF-1.4'), 'test.pdf');
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.riskAnalysis.isComplete).toBe(true);
    });

    it('Debería fallar (409) al intentar duplicar el CUIT', async () => {
      const res = await request(app)
        .post('/api/companies/create')
        .field('nombre', 'Empresa Duplicada')
        .field('cuit', '20123456789')
        .field('pais', 'Argentina')
        .field('industria', 'Tecnologia');
      
      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
    });
  });
});