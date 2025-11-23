import Dexie, { Table } from 'dexie';
import { CriarVendaData } from './vendas';
import { ProdutoComEstoque } from './produtos';
import { Container } from './containers';

// Estrutura de vendas offline
export interface VendaOffline extends CriarVendaData {
  id?: number;
  timestamp: number;
  synced: boolean;
  vendaId?: string;
}

// Database class
export class OfflineDatabase extends Dexie {
  vendas!: Table<VendaOffline, number>;
  produtos!: Table<ProdutoComEstoque, string>;
  containers!: Table<Container, string>;

  constructor() {
    super('VendasMaxDB');

    this.version(1).stores({
      vendas: '++id, timestamp, synced',
      produtos: 'id, categoriaId, ativo',
      containers: 'id, condominioId, ativo',
    });
  }
}

export const db = new OfflineDatabase();

// Serviços de operação offline
export const offlineService = {
  // Salvar venda offline
  salvarVendaOffline: async (venda: CriarVendaData): Promise<number> => {
    const vendaOffline: VendaOffline = {
      ...venda,
      timestamp: Date.now(),
      synced: false,
    };
    return await db.vendas.add(vendaOffline);
  },

  // Obter vendas não sincronizadas
  getVendasNaoSincronizadas: async (): Promise<VendaOffline[]> => {
    return await db.vendas.where('synced').equals(false).toArray();
  },

  // Marcar venda como sincronizada
  marcarVendaSincronizada: async (id: number, vendaId: string): Promise<void> => {
    await db.vendas.update(id, { synced: true, vendaId });
  },

  // Salvar produtos em cache
  salvarProdutos: async (produtos: ProdutoComEstoque[]): Promise<void> => {
    await db.produtos.clear();
    await db.produtos.bulkAdd(produtos);
  },

  // Obter produtos do cache
  getProdutos: async (): Promise<ProdutoComEstoque[]> => {
    return await db.produtos.toArray();
  },

  // Salvar containers em cache
  salvarContainers: async (containers: Container[]): Promise<void> => {
    await db.containers.clear();
    await db.containers.bulkAdd(containers);
  },

  // Obter containers do cache
  getContainers: async (): Promise<Container[]> => {
    return await db.containers.toArray();
  },

  // Limpar dados (útil para logout)
  limparDados: async (): Promise<void> => {
    await db.vendas.clear();
    await db.produtos.clear();
    await db.containers.clear();
  },
};
