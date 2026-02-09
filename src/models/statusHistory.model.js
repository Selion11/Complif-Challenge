const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class StatusHistory extends Model {}

StatusHistory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cuit_empresa: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'cuit'
    }
  },
  estado_anterior: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado_nuevo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'StatusHistory',
  tableName: 'status_history',
  timestamps: true
});

module.exports = StatusHistory;