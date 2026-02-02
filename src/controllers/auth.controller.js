const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        cuit: user.cuit_empresa 
      },
      process.env.JWT_SECRET || 'secret_key_provisoria',
      { expiresIn: '8h' }
    );

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const { username, password, cuit_empresa } = req.body;
    
    const newUser = await User.create({ username, password, cuit_empresa });
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado con éxito',
      user: { id: newUser.id, username: newUser.username } 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, signup };