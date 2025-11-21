import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token inválido ou expirado
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Sessão expirada. Faça login novamente.');
      }

      // Sem permissão
      else if (status === 403) {
        toast.error('Você não tem permissão para executar esta ação.');
      }

      // Erro do servidor
      else if (status >= 500) {
        toast.error('Erro no servidor. Tente novamente mais tarde.');
      }

      // Outros erros
      else if (data?.error) {
        toast.error(data.error);
      }
    } else if (error.request) {
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      toast.error('Erro inesperado. Tente novamente.');
    }

    return Promise.reject(error);
  }
);

export default api;
