const Company = require('./company.model');
const User = require('./user.model');

Company.hasMany(User, { foreignKey: 'cuit_empresa' });
User.belongsTo(Company, { foreignKey: 'cuit_empresa' });