const Company = require('./company.model');
const User = require('./user.model');
const User = require('./user.model');
const Group = require('./group.model');

Company.hasMany(User, { foreignKey: 'cuit_empresa' });
User.belongsTo(Company, { foreignKey: 'cuit_empresa' });
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