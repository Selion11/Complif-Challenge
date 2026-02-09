const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Signature extends Model {}

Signature.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  id_request: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'signature_requests', key: 'id' }
  },
  id_usuario: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, {
  sequelize,
  modelName: 'Signature',
  tableName: 'signatures',
  timestamps: true,
  updatedAt: false
});

module.exports = Signature;