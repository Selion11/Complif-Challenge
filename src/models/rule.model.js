const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Rule extends Model {}

Rule.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Restringimos el nombre de la regla a los tipos de la imagen
  nombre_regla: {
    type: DataTypes.ENUM(
      'CREATE_WIRE',
      'APPROVE_WIRE',
      'REQUEST_LOAN',
      'MODIFY_CONTACT_INFO'
    ),
    allowNull: false
  },
  id_grupo: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  cantidad_requerida: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1 // Aseguramos que al menos se requiera un firmante
    }
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
  modelName: 'Rule',
  tableName: 'rules',
  timestamps: true
});

module.exports = Rule;