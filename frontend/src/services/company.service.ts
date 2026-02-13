import api from './api';

export const getCompanies = async (filters: any = {}) => {
  // Coincide con GET /api/companies
  const response = await api.get('/companies', { params: filters });
  return response.data;
};

export const getCompanyDetail = async (cuit: string) => {
  // Coincide con GET /api/companies/:cuit
  const response = await api.get(`/companies/${cuit}`);
  return response.data;
};

export const createCompany = async (formData: FormData) => {
  // Coincide con POST /api/companies/create
  const response = await api.post('/companies/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateCompanyStatus = async (cuit: string, status: string, comment: string) => {
  // Coincide con PATCH /api/companies/:cuit/status
  const response = await api.patch(`/companies/${cuit}/status`, { status, comment });
  return response.data;
};

export const getRiskScore = async (cuit: string) => {
  // Coincide con GET /api/companies/:cuit/risk-score
  const response = await api.get(`/companies/${cuit}/risk-score`);
  return response.data;
};