const riskService = require('../services/riskCalculator.service');

describe('Risk Calculator Logic', () => {
    it('Debería sumar 20 puntos si la documentación está incompleta', () => {
        const data = {
            pais: 'Argentina',
            industria: 'Tecnologia', 
            hasDocuments: false 
        };
        
        const score = riskService.calculateRiskScore(data, 'Test');
        expect(score).toBe(20);
    });

    it('Debería asignar score alto (>70) para industrias de riesgo como Casinos', () => {
        const data = {
            pais: 'Argentina',
            industria: 'Casinos',
            hasDocuments: true
        };
        
        const score = riskService.calculateRiskScore(data, 'Test');
        expect(score).toBeGreaterThanOrEqual(70);
    });
});