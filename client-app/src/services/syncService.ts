import { offlineService } from './offlineDb';
import { vendasService } from './vendas';
import { toast } from 'sonner';

class SyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;

  // Iniciar sincronização automática
  startAutoSync() {
    // Aguardar 5 segundos antes da primeira tentativa (dar tempo para app carregar)
    setTimeout(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncVendas();
      }
    }, 5000);

    // Tentar sincronizar a cada 30 segundos quando online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncVendas();
      }
    }, 30000);

    // Sincronizar quando voltar online
    window.addEventListener('online', () => {
      // Aguardar 1 segundo após voltar online antes de tentar
      setTimeout(() => {
        this.syncVendas();
      }, 1000);
    });
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sincronizar vendas pendentes
  async syncVendas(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;

    try {
      const vendasPendentes = await offlineService.getVendasNaoSincronizadas();

      if (vendasPendentes.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`🔄 Sincronizando ${vendasPendentes.length} venda(s) pendente(s)...`);

      let sucessos = 0;
      let falhas = 0;

      for (const vendaOffline of vendasPendentes) {
        try {
          // Remover campos que não devem ser enviados
          const { id, timestamp, synced, vendaId, ...vendaData } = vendaOffline;

          // Enviar venda para o servidor
          const vendaCriada = await vendasService.criar(vendaData);

          // Marcar como sincronizada
          await offlineService.marcarVendaSincronizada(id!, vendaCriada.id);

          sucessos++;
        } catch (error) {
          console.error('❌ Erro ao sincronizar venda:', error);
          falhas++;
        }
      }

      if (sucessos > 0) {
        console.log(`✅ ${sucessos} venda(s) sincronizada(s) com sucesso!`);
        toast.success(`${sucessos} venda(s) sincronizada(s) com sucesso!`);
      }

      if (falhas > 0) {
        console.warn(`⚠️ ${falhas} venda(s) falharam ao sincronizar.`);
        toast.error(`${falhas} venda(s) falharam ao sincronizar. Tentaremos novamente.`);
      }
    } catch (error) {
      // Não logar erro se for só porque não há vendas pendentes
      if (error instanceof Error && !error.message.includes('no such table')) {
        console.error('❌ Erro ao sincronizar vendas:', error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  // Verificar se há vendas pendentes
  async hasPendingVendas(): Promise<boolean> {
    const vendas = await offlineService.getVendasNaoSincronizadas();
    return vendas.length > 0;
  }

  // Obter contagem de vendas pendentes
  async getPendingCount(): Promise<number> {
    const vendas = await offlineService.getVendasNaoSincronizadas();
    return vendas.length;
  }
}

export const syncService = new SyncService();
