const { SignatureRequest, Signature, Rule, User, Group } = require('../models');
const logger = require('../utils/logger'); 

const createRequest = async (req, res, next) => {
  try {
    const { accion, descripcion } = req.body;
    // IMPORTANTE: Asegúrate de que el middleware de auth cargue 'cuit' en req.user
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

    // Registrar la firma del usuario
    await Signature.findOrCreate({
      where: { id_request: requestId, id_usuario: userId }
    });

    // Traer todas las firmas actuales con sus grupos para validar reglas
    const currentSignatures = await Signature.findAll({
      where: { id_request: requestId },
      include: [{
        model: User,
        include: [Group] 
      }]
    });

    // CORRECCIÓN CRÍTICA: Se cambió 'facultad' por 'nombre_regla' para coincidir con la DB
    const rules = await Rule.findAll({
      where: { 
        nombre_regla: request.accion, 
        cuit_empresa 
      }
    });

    // Validar si alguna regla de firma conjunta se cumple
    const isApproved = rules.some(rule => {
      const count = currentSignatures.filter(sig => 
        // CORRECCIÓN CRÍTICA: Se cambió 'grupo_id' por 'id_grupo' para coincidir con la DB
        sig.User.Groups.some(g => g.id === rule.id_grupo)
      ).length;
      return count >= rule.cantidad_requerida;
    });

    if (isApproved) {
      request.estado = 'COMPLETED';
      await request.save();

      logger.info({
        event: 'SIGNATURE_REQUEST_COMPLETED',
        service: 'SignatureController',
        message: `Solicitud ${requestId} completada exitosamente`,
        cuit: cuit_empresa
      });
    }

    res.json({ 
      success: true, 
      estado: request.estado, 
      firmas_actuales: currentSignatures.length 
    });
  } catch (error) {
    console.error("ERROR EN SIGN_REQUEST:", error);
    next(error);
  }
};

module.exports = { createRequest, signRequest };