const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Group extends Model {}

Group.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
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
  modelName: 'Group',
  tableName: 'groups',
  timestamps: true
});

module.exports = Group;