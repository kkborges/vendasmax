import api from './api';
import { DashboardData, RelatorioVendas } from '../types';

export const relatoriosService = {
  dashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/relatorios/dashboard');
    return response.data;
  },

  vendas: async (params: {
    dataInicio: string;
    dataFim: string;
    containerId?: string;
    periodo?: string;
  }): Promise<RelatorioVendas> => {
    const response = await api.get('/relatorios/vendas', { params });
    return response.data;
  },

  estoque: async (containerId?: string): Promise<any> => {
    const response = await api.get('/relatorios/estoque', {
      params: containerId ? { containerId } : undefined,
    });
    return response.data;
  },

  financeiro: async (params: {
    dataInicio: string;
    dataFim: string;
  }): Promise<any> => {
    const response = await api.get('/relatorios/financeiro', { params });
    return response.data;
  },
};
