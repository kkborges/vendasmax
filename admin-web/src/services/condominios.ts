import api from './api';
import { Condominio, PaginatedResponse } from '../types';

export const condominiosService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Condominio>> => {
    const response = await api.get('/condominios', { params });
    return {
      data: response.data.condominios,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  getById: async (id: string): Promise<Condominio> => {
    const response = await api.get(`/condominios/${id}`);
    return response.data;
  },

  create: async (data: Partial<Condominio>): Promise<Condominio> => {
    const response = await api.post('/condominios', data);
    return response.data.condominio;
  },

  update: async (id: string, data: Partial<Condominio>): Promise<Condominio> => {
    const response = await api.put(`/condominios/${id}`, data);
    return response.data.condominio;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/condominios/${id}`);
  },

  rescindirContrato: async (id: string): Promise<Condominio> => {
    const response = await api.patch(`/condominios/${id}/rescindir`);
    return response.data.condominio;
  },
};
