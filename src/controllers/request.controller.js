const { SignatureRequest, Signature, Rule, User, Group } = require('../models');

const createRequest = async (req, res, next) => {
  try {
    const { accion, descripcion } = req.body;
    const cuit_empresa = req.user.cuit;

    const request = await SignatureRequest.create({
      accion,
      descripcion,
      cuit_empresa
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

const signRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const cuit_empresa = req.user.cuit;

    const request = await SignatureRequest.findByPk(requestId);

    if (!request || request.cuit_empresa !== cuit_empresa) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    if (request.estado !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'La solicitud ya no está pendiente' });
    }

    await Signature.findOrCreate({
      where: { id_request: requestId, id_usuario: userId }
    });

    const currentSignatures = await Signature.findAll({
      where: { id_request: requestId },
      include: [{
        model: User,
        include: [Group] 
      }]
    });

    const rules = await Rule.findAll({
      where: { nombre_regla: request.accion, cuit_empresa }
    });

    const isApproved = rules.some(rule => {
      const count = currentSignatures.filter(sig => 
        sig.User.Groups.some(g => g.id === rule.id_grupo)
      ).length;
      return count >= rule.cantidad_requerida;
    });

    if (isApproved) {
      request.estado = 'COMPLETED';
      await request.save();
    }

    res.json({ 
      success: true, 
      estado: request.estado, 
      firmas_actuales: currentSignatures.length 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, signRequest };