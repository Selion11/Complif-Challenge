// src/models/index.js
const { 
  Company, 
  User, 
  Group, 
  Rule, 
  SignatureRequest, 
  Signature, 
  Document 
} = require('./models.relations');

// Importamos también el historial si existe como archivo separado para los tests de trazabilidad
const StatusHistory = require('./statusHistory.model');

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