import api from './api';

// --- GESTIÓN DE GRUPOS ---
export const createGroup = async (nombre: string) => {
  // ✅ Enviamos 'nombre' para que el controlador lo reciba correctamente
  const response = await api.post('/groups', { nombre });
  return response.data;
};

export const addUserToGroup = async (userId: string, groupId: string) => {
  const response = await api.post('/groups/add-user', { userId, groupId });
  return response.data;
};

// --- REGLAS DE NEGOCIO ---
export const createRule = async (companyCuit: string, requirementType: string, config: any) => {
  const response = await api.post('/rules', { 
    companyCuit, 
    requirementType, 
    config 
  });
  return response.data;
};

export const getRulesByCompany = async (companyCuit: string) => {
  const response = await api.get('/rules', { params: { companyCuit } });
  return response.data;
};

// --- SOLICITUDES DE FIRMA ---

// ✅ Agregado para traer datos reales de la DB
export const getSignatureRequests = async () => {
  const response = await api.get('/requests');
  return response.data;
};

export const createSignatureRequest = async (data: { accion: string, descripcion: string }) => {
  // Enviamos el objeto tal cual lo espera el backend
  const response = await api.post('/requests', data);
  return response.data;
};

// ✅ Cambiado requestId a string para soportar UUID
export const signDocument = async (requestId: string) => {
  const response = await api.post(`/requests/${requestId}/sign`);
  return response.data;
};