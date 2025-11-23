import api from './api';
import { Venda, PaginatedResponse } from '../types';

export const vendasService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    containerId?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<PaginatedResponse<Venda>> => {
    const response = await api.get('/vendas', { params });
    return {
      data: response.data.vendas,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  getById: async (id: string): Promise<Venda> => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: string,
    observacao?: string
  ): Promise<Venda> => {
    const response = await api.patch(`/vendas/${id}/status`, {
      status,
      observacao,
    });
    return response.data.venda;
  },

  cancelar: async (id: string, motivo: string): Promise<void> => {
    await api.post(`/vendas/${id}/cancelar`, { motivo });
  },
};
