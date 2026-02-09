const Company = require('./company.model');
const User = require('./user.model');
const Group = require('./group.model');
const Rule = require('./rule.model');

// RELACIONES: Empresa <-> Usuario
Company.hasMany(User, { foreignKey: 'cuit_empresa' });
User.belongsTo(Company, { foreignKey: 'cuit_empresa' });

// RELACIONES: Usuario <-> Grupo (Muchos a Muchos)
User.belongsToMany(Group, { 
  through: 'UserGroups', 
  foreignKey: 'userId',
  otherKey: 'groupId'
});

Group.belongsToMany(User, { 
  through: 'UserGroups', 
  foreignKey: 'groupId',
  otherKey: 'userId'
});

// RELACIONES: Empresa <-> Regla
Company.hasMany(Rule, { foreignKey: 'cuit_empresa' });
Rule.belongsTo(Company, { foreignKey: 'cuit_empresa' });

// RELACIONES: Grupo <-> Regla
Group.hasMany(Rule, { foreignKey: 'id_grupo' });
Rule.belongsTo(Group, { foreignKey: 'id_grupo' });

module.exports = {
  Company,
  User,
  Group,
  Rule
}