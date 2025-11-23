import api from './api';

export interface Container {
  id: string;
  condominioId: string;
  localizacao: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export const containersService = {
  listByCondominio: async (condominioId: string): Promise<Container[]> => {
    const response = await api.get(`/containers?condominioId=${condominioId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Container> => {
    const response = await api.get(`/containers/${id}`);
    return response.data;
  },
};
