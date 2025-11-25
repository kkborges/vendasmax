import api from './api';

export interface Produto {
  id: string;
  categoriaId: string;
  nome: string;
  descricao?: string;
  codigoBarras?: string;
  qrCode?: string;
  foto?: string;
  preco: number;
  estoqueMinimo: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  categoria?: {
    id: string;
    nome: string;
  };
  estoqueGeral?: {
    quantidade: number;
  }[];
  containerEstoque?: {
    quantidade: number;
    containerId: string;
  }[];
}

export interface ProdutoComEstoque extends Produto {
  quantidadeDisponivel: number;
}

export const produtosService = {
  listByContainer: async (containerId: string): Promise<ProdutoComEstoque[]> => {
    const response = await api.get(`/produtos/container/${containerId}`);
    return response.data;
  },

  getByCode: async (code: string): Promise<Produto> => {
    const response = await api.get(`/produtos/codigo/${code}`);
    return response.data;
  },

  getById: async (id: string): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },
};
