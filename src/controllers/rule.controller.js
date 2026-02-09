const { Rule } = require('../models');

const createRule = async (req, res, next) => {
  try {
    const { nombre_regla, id_grupo, cantidad_requerida } = req.body;
    const cuit_empresa = req.user.cuit; 
    
    const rule = await Rule.create({
      nombre_regla,
      id_grupo,
      cantidad_requerida,
      cuit_empresa
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    next(error);
  }
};

const getRulesByCompany = async (req, res, next) => {
  try {
    const rules = await Rule.findAll({
      where: { cuit_empresa: req.user.cuit } 
    });
    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRule, getRulesByCompany };