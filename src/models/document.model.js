const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.ENUM('certificadoFiscal', 'constanciaInscripcion', 'polizaSeguro'),
    allowNull: false
  },
  ruta_archivo: {
    type: DataTypes.STRING,
    allowNull: false
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
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;