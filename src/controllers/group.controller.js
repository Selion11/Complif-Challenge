const Group = require('../models/group.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const createGroup = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const cuit_empresa = req.user.cuit; 

    const group = await Group.create({ nombre, cuit_empresa });
    
    logger.info({
      event: 'GROUP_CREATED',
      service: 'GroupController',
      message: `Nuevo grupo de firmantes creado: ${nombre}`,
      cuit: cuit_empresa,
      actor: req.user.id,
      groupId: group.id
    });
    
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const addUserToGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findByPk(groupId);
    const user = await User.findByPk(userId);

    if (!group || !user) {
      return res.status(404).json({ success: false, message: 'Grupo o Usuario no encontrado' });
    }

    if (group.cuit_empresa !== req.user.cuit || user.cuit_empresa !== req.user.cuit) {
      return res.status(403).json({ success: false, message: 'Acción no permitida para esta empresa' });
    }

    await group.addUser(user);

    logger.info({
      event: 'USER_ASSIGNED_TO_GROUP',
      service: 'GroupController',
      message: `Usuario ${user.username} asignado al grupo ${group.nombre}`,
      cuit: req.user.cuit,
      actor: req.user.id,
      targetUserId: userId,
      groupId: groupId
    });

    res.json({ success: true, message: 'Usuario añadido al grupo con éxito' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, addUserToGroup };