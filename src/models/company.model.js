const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  cuit: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false
  },
  industria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  riskScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0 
  },
  status: {
    type: DataTypes.ENUM('PENDING_REVIEW', 'AUTO_APPROVED', 'APPROVED', 'REJECTED'),
    defaultValue: 'PENDING_REVIEW'
  }
}, {
  timestamps: true, 
  tableName: 'companies'
});

module.exports = Company;