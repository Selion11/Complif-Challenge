import api from './api';

// --- GESTIÓN DE GRUPOS ---
export const createGroup = async (name: string, description: string) => {
  const response = await api.post('/groups', { name, description });
  return response.data;
};

export const addUserToGroup = async (userId: number, groupId: number) => {
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
export const createSignatureRequest = async (data: { companyCuit: string, documentId: number, title: string }) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const signDocument = async (requestId: number) => {
  const response = await api.post(`/requests/${requestId}/sign`);
  return response.data;
};
