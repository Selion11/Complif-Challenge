const { SignatureRequest, Signature, Rule, User, Group } = require('../models');
const logger = require('../utils/logger'); 

const createRequest = async (req, res, next) => {
  try {
    const { accion, descripcion } = req.body;
    const cuit_empresa = req.user.cuit;

    const request = await SignatureRequest.create({
      accion,
      descripcion,
      cuit_empresa
    });

    logger.info({
      event: 'SIGNATURE_REQUEST_CREATED',
      service: 'SignatureController',
      message: `Nueva solicitud para facultad: ${accion}`,
      cuit: cuit_empresa,
      requestId: request.id,
      actor: req.user.id
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

    const [signature, created] = await Signature.findOrCreate({
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
      where: { facultad: request.accion, cuit_empresa }
    });

    const isApproved = rules.some(rule => {
      const count = currentSignatures.filter(sig => 
        sig.User.Groups.some(g => g.id === rule.grupo_id)
      ).length;
      return count >= rule.cantidad_requerida;
    });

    const oldStatus = request.estado;

    if (isApproved) {
      request.estado = 'COMPLETED';
      await request.save();

      logger.info({
        event: 'SIGNATURE_REQUEST_COMPLETED',
        service: 'SignatureController',
        message: `Solicitud ${requestId} completada exitosamente`,
        cuit: cuit_empresa,
        facultad: request.accion
      });
    } else {
      logger.info({
        event: 'SIGNATURE_ADDED',
        service: 'SignatureController',
        message: `Usuario ${userId} firmó solicitud ${requestId}`,
        cuit: cuit_empresa,
        currentStatus: request.estado
      });
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