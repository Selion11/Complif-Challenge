import api from './api';

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_cuit', response.data.user.cuit_empresa);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_cuit');
  window.location.href = '/login';
};