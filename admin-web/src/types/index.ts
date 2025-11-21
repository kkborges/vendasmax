export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'ADMIN' | 'OPERADOR' | 'VENDEDOR';
}

export interface Condominio {
  id: string;
  cnpj: string;
  nome: string;
  rua: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  totalBlocos: number;
  totalApartamentos: number;
  ativo: boolean;
  contratoRescindido: boolean;
  usuario?: string;
  createdAt: string;
  updatedAt: string;
  containers?: Container[];
}

export interface Container {
  id: string;
  condominioId: string;
  bloco?: string;
  espaco?: string;
  localizacao: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  condominio?: Condominio;
  estoque?: ContainerEstoque[];
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Produto {
  id: string;
  categoriaId: string;
  nome: string;
  descricao?: string;
  codigoBarras?: string;
  qrCode?: string;
  foto?: string;
  estoqueMinimo: number;
  valorCompra: number;
  valorVenda: number;
  unidade: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  categoria?: Categoria;
  estoqueGeral?: EstoqueGeral;
}

export interface EstoqueGeral {
  id: string;
  produtoId: string;
  quantidade: number;
  updatedAt: string;
  produto?: Produto;
}

export interface ContainerEstoque {
  id: string;
  containerId: string;
  produtoId: string;
  quantidade: number;
  dataValidade?: string;
  lote?: string;
  updatedAt: string;
  container?: Container;
  produto?: Produto;
}

export interface Venda {
  id: string;
  containerId: string;
  numeroVenda: string;
  valorTotal: number;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'PARCIAL';
  modoOffline: boolean;
  sincronizada: boolean;
  clienteNome?: string;
  clienteBloco?: string;
  clienteApto?: string;
  clienteContato?: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
  container?: Container;
  itens?: VendaItem[];
  pagamentos?: Pagamento[];
}

export interface VendaItem {
  id: string;
  vendaId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  desconto: number;
  produto?: Produto;
}

export interface Pagamento {
  id: string;
  vendaId: string;
  metodoPagamento: 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';
  gateway?: 'STRIPE' | 'MERCADOPAGO' | 'MAQUININHA';
  valorPago: number;
  status: 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'RECUSADO' | 'ERRO' | 'CANCELADO';
  tentativas: number;
  transactionId?: string;
  erroMensagem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  resumo: {
    totalCondominios: number;
    totalContainers: number;
    totalProdutos: number;
    totalVendas: number;
    vendasPendentes: number;
    vendasHoje: number;
    valorTotalUltimos30Dias: number;
  };
}

export interface RelatorioVendas {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    totalVendas: number;
    valorTotal: number;
    ticketMedio: number;
    vendasPorStatus: Record<string, number>;
  };
  topProdutos: Array<{
    produto: Produto;
    quantidade: number;
    valorTotal: number;
  }>;
  vendasPorCategoria: Record<string, {
    quantidade: number;
    valorTotal: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
