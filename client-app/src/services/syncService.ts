import { offlineService } from './offlineDb';
import { vendasService } from './vendas';
import { toast } from 'sonner';

class SyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;

  // Iniciar sincronização automática
  startAutoSync() {
    // Tentar sincronizar a cada 30 segundos quando online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncVendas();
      }
    }, 30000);

    // Sincronizar quando voltar online
    window.addEventListener('online', () => {
      this.syncVendas();
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

      console.log(`Sincronizando ${vendasPendentes.length} vendas pendentes...`);

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
          console.error('Erro ao sincronizar venda:', error);
          falhas++;
        }
      }

      if (sucessos > 0) {
        toast.success(`${sucessos} venda(s) sincronizada(s) com sucesso!`);
      }

      if (falhas > 0) {
        toast.error(`${falhas} venda(s) falharam ao sincronizar. Tentaremos novamente.`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar vendas:', error);
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
