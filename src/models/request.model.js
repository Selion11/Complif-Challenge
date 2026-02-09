const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class SignatureRequest extends Model {}

SignatureRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  accion: {
    type: DataTypes.ENUM(
      'CREATE_WIRE',
      'APPROVE_WIRE',
      'REQUEST_LOAN',
      'MODIFY_CONTACT_INFO'
    ),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  cuit_empresa: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'cuit'
    }
  }
}, {
  sequelize,
  modelName: 'SignatureRequest',
  tableName: 'signature_requests',
  timestamps: true
});

module.exports = SignatureRequest;