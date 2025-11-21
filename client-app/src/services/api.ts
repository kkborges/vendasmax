import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Sessão expirada');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (!navigator.onLine) {
      toast.warning('Sem conexão. Operações serão sincronizadas depois.');
    }
    return Promise.reject(error);
  }
);

export default api;
