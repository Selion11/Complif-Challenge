const Company = require('./company.model');
const User = require('./user.model');
const Group = require('./group.model');
const Rule = require('./rule.model');
const SignatureRequest = require('./request.model');
const Signature = require('./signature.model');
const Document = require('./document.model');
const StatusHistory = require('./statusHistory.model');

// --- CENTRALIZACIÓN DE RELACIONES ---

// 1. DOCUMENTACIÓN
// Una empresa tiene muchos documentos asociados a su legajo.
Company.hasMany(Document, { foreignKey: 'cuit_empresa', as: 'documentos' });
Document.belongsTo(Company, { foreignKey: 'cuit_empresa' });

// 2. USUARIOS Y EMPRESAS
// Relación de pertenencia de empleados a una corporación.
Company.hasMany(User, { foreignKey: 'cuit_empresa' });
User.belongsTo(Company, { foreignKey: 'cuit_empresa' });

// 3. GRUPOS Y USUARIOS (Muchos a Muchos)
// Manejo de jerarquías de firma mediante tabla intermedia.
User.belongsToMany(Group, { through: 'UserGroups', foreignKey: 'userId', otherKey: 'groupId' });
Group.belongsToMany(User, { through: 'UserGroups', foreignKey: 'groupId', otherKey: 'userId' });

// 4. GRUPOS Y EMPRESAS
// Permite listar los grupos creados específicamente para una empresa.
Company.hasMany(Group, { foreignKey: 'cuit_empresa' });
Group.belongsTo(Company, { foreignKey: 'cuit_empresa' });

// 5. REGLAS DE NEGOCIO
// Reglas de firma vinculadas a la empresa y a sus grupos lógicos.
Company.hasMany(Rule, { foreignKey: 'cuit_empresa' });
Rule.belongsTo(Company, { foreignKey: 'cuit_empresa' });

Group.hasMany(Rule, { foreignKey: 'id_grupo' });
Rule.belongsTo(Group, { foreignKey: 'id_grupo' });

// 6. SOLICITUDES DE FIRMA Y FIRMAS
// Flujo de aprobación de operaciones.
Company.hasMany(SignatureRequest, { foreignKey: 'cuit_empresa' });
SignatureRequest.belongsTo(Company, { foreignKey: 'cuit_empresa' });

SignatureRequest.hasMany(Signature, { foreignKey: 'id_request' });
Signature.belongsTo(SignatureRequest, { foreignKey: 'id_request' });

User.hasMany(Signature, { foreignKey: 'id_usuario' });
Signature.belongsTo(User, { foreignKey: 'id_usuario' });

// 7. HISTORIAL DE ESTADOS (AUDITORÍA)
// Relación con Empresa: El historial sigue el CUIT de la empresa.
Company.hasMany(StatusHistory, { foreignKey: 'cuit_empresa', sourceKey: 'cuit' });
StatusHistory.belongsTo(Company, { foreignKey: 'cuit_empresa', targetKey: 'cuit' });

// Relación con Usuario: Identifica al auditor (admin) que realizó el cambio.
User.hasMany(StatusHistory, { foreignKey: 'usuario_id' });
StatusHistory.belongsTo(User, { foreignKey: 'usuario_id' });

module.exports = {
  Company,
  User,
  Group,
  Rule,
  SignatureRequest,
  Signature,
  Document,
  StatusHistory
};