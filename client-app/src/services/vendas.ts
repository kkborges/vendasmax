import api from './api';

export interface VendaItem {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface CriarVendaData {
  condominioId: string;
  containerId: string;
  itens: VendaItem[];
  valorTotal: number;
  metodoPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'MAQUININHA';
  gateway?: 'STRIPE' | 'MERCADOPAGO';
  dadosCliente?: {
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
  };
}

export interface Venda {
  id: string;
  numero: string;
  condominioId: string;
  containerId: string;
  valorTotal: number;
  status: 'PENDENTE' | 'PROCESSANDO' | 'PAGO' | 'CANCELADO' | 'FALHOU';
  createdAt: string;
  itens: Array<{
    id: string;
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
    produto: {
      nome: string;
      foto?: string;
    };
  }>;
  pagamentos: Array<{
    id: string;
    transactionId?: string;
    metodoPagamento: string;
    gateway: string;
    valorPago: number;
    status: string;
    pixQrCode?: string;
    pixQrCodeBase64?: string;
    tentativasRealizadas: number;
    dadosCliente?: any;
  }>;
}

export const vendasService = {
  criar: async (data: CriarVendaData): Promise<Venda> => {
    const response = await api.post('/vendas', data);
    return response.data;
  },

  getById: async (id: string): Promise<Venda> => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  verificarStatusPagamento: async (vendaId: string): Promise<Venda> => {
    const response = await api.get(`/vendas/${vendaId}/status-pagamento`);
    return response.data;
  },

  tentarNovamente: async (vendaId: string, dadosCliente?: any): Promise<Venda> => {
    const response = await api.post(`/vendas/${vendaId}/retry`, { dadosCliente });
    return response.data;
  },
};
