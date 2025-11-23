import api from './api';
import { Produto, Categoria, PaginatedResponse } from '../types';

export const produtosService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoriaId?: string;
  }): Promise<PaginatedResponse<Produto>> => {
    const response = await api.get('/produtos', { params });
    return {
      data: response.data.produtos,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  getById: async (id: string): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  getByCode: async (code: string): Promise<Produto> => {
    const response = await api.get(`/produtos/codigo/${code}`);
    return response.data;
  },

  create: async (data: Partial<Produto>): Promise<Produto> => {
    const response = await api.post('/produtos', data);
    return response.data.produto;
  },

  update: async (id: string, data: Partial<Produto>): Promise<Produto> => {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data.produto;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};

export const categoriasService = {
  list: async (): Promise<Categoria[]> => {
    const response = await api.get('/produtos/categorias/listar');
    return response.data.categorias;
  },

  create: async (data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.post('/produtos/categorias', data);
    return response.data.categoria;
  },

  update: async (id: string, data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.put(`/produtos/categorias/${id}`, data);
    return response.data.categoria;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/produtos/categorias/${id}`);
  },
};
