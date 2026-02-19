import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}`,
});

// Interceptor de Petición (Request): Inyecta el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, no hacemos nada
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      if (typeof window !== 'undefined') {
        console.warn("⚠️ Sesión inválida o base de datos reiniciada. Limpiando credenciales...");
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user'); 
        
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;