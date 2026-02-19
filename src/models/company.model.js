const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  cuit: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  industry: {
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