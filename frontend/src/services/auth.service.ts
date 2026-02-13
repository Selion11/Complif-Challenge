import api from './api';
import Cookies from 'js-cookie';

interface SignupData {
  username: string;
  password: string;
  cuit_empresa: string;
  role?: 'admin' | 'viewer';
}

export const signup = async (data: SignupData) => {
  try {
    const response = await api.post('/auth/signup', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_cuit', response.data.user.cuit_empresa);
      
      Cookies.set('auth_token', response.data.token, { expires: 1 });
      Cookies.set('user_role', response.data.user.role, { expires: 1 });
      Cookies.set('user_cuit', response.data.user.cuit_empresa, { expires: 1 });
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

  Cookies.remove('auth_token');
  Cookies.remove('user_role');
  Cookies.remove('user_cuit');

  window.location.href = '/login';
};