const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso denegado. No se proporcionó un token.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_provisoria');
    
    req.user = decoded; 

    const requestedCuit = req.params.cuit || req.body.cuit || req.body.cuit_empresa;

    if (requestedCuit && requestedCuit !== req.user.cuit) {
      return res.status(403).json({ 
        success: false, 
        message: 'Prohibido: No tienes permiso para realizar acciones en esta empresa.' 
      });
    }

    next(); 
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

module.exports = authenticate;