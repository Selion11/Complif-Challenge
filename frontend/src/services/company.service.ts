import api from './api';

export const getCompanies = async (filters: { country?: string; industry?: string; name?: string; page?: number } = {}) => {
  const apiParams: any = {};
  
  if (filters.country) apiParams.country = filters.country;
  if (filters.industry) apiParams.industry = filters.industry;
  if (filters.name) apiParams.name = filters.name;
  if (filters.page) apiParams.page = filters.page;
  apiParams.limit = 10; 

  const response = await api.get('/companies', { params: apiParams });
  return response.data;
};

export const getCompanyDetail = async (cuit: string) => {
  const response = await api.get(`/companies/${cuit}`);
  return response.data;
};

export const createCompany = async (formData: FormData) => {
  const response = await api.post('/companies/create', formData);
  return response.data;
};


export const getRiskScore = async (cuit: string) => {
  const response = await api.get(`/companies/${cuit}/risk-score`);
  return response.data;
};

export const updateSingleDocument = async (cuit: string, formData: FormData) => {
  const response = await api.patch(`/companies/${cuit}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const getUsersByCompany = async (cuit: string) => {
  const response = await api.get(`/companies/${cuit}/users`);
  return response.data;
};

export const updateCompanyStatus = async (cuit: string, status: string, comment: string) => {
  const response = await api.patch(`/companies/${cuit}/status`, { status, comment });
  return response.data;
};

export const getStatusHistory = async (cuit: string) => {
  const response = await api.get(`/companies/${cuit}/status-history`);
  return response.data;
};