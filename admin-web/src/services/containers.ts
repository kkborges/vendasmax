import api from './api';
import { Container, ContainerEstoque } from '../types';

export const containersService = {
  list: async (condominioId?: string): Promise<Container[]> => {
    const response = await api.get('/containers', {
      params: condominioId ? { condominioId } : undefined,
    });
    return response.data.containers;
  },

  getById: async (id: string): Promise<Container> => {
    const response = await api.get(`/containers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Container>): Promise<Container> => {
    const response = await api.post('/containers', data);
    return response.data.container;
  },

  update: async (id: string, data: Partial<Container>): Promise<Container> => {
    const response = await api.put(`/containers/${id}`, data);
    return response.data.container;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/containers/${id}`);
  },

  getEstoque: async (id: string): Promise<ContainerEstoque[]> => {
    const response = await api.get(`/containers/${id}/estoque`);
    return response.data.estoque;
  },

  updateEstoque: async (
    id: string,
    data: {
      produtoId: string;
      quantidade: number;
      dataValidade?: string;
      lote?: string;
    }
  ): Promise<ContainerEstoque> => {
    const response = await api.put(`/containers/${id}/estoque`, data);
    return response.data.estoque;
  },
};
