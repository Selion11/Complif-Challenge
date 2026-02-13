const User = require('./user.model');
const Company = require('./company.model');
const Group = require('./group.model');
const Rule = require('./rule.model');
const SignatureRequest = require('./request.model');
const Signature = require('./signature.model');
const StatusHistory = require('./statusHistory.model');

// Configurar asociaciones (relaciones)
require('./models.relations'); 

module.exports = {
    User,
    Company,
    Group,
    Rule,
    SignatureRequest,
    Signature,
    StatusHistory
};