import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { containersService } from '../services/containers';
import { offlineService } from '../services/offlineDb';
import { useOnline } from '../hooks/useOnline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import { MapPin, LogOut, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ContainerSelect() {
  const navigate = useNavigate();
  const isOnline = useOnline();
  const { condominio, setSelectedContainer, logout } = useAuthStore();
  const [offlineContainers, setOfflineContainers] = useState<any[]>([]);

  // Buscar containers online
  const { data: onlineContainers, isLoading } = useQuery({
    queryKey: ['containers', condominio?.id],
    queryFn: () => containersService.listByCondominio(condominio!.id),
    enabled: !!condominio && isOnline,
    onSuccess: async (data) => {
      // Salvar no cache para uso offline
      await offlineService.salvarContainers(data);
    },
  });

  // Carregar containers do cache quando offline
  useEffect(() => {
    if (!isOnline && condominio) {
      offlineService.getContainers().then(setOfflineContainers);
    }
  }, [isOnline, condominio]);

  const containers = isOnline ? onlineContainers : offlineContainers;

  const handleSelectContainer = (container: any) => {
    setSelectedContainer(container);
    toast.success(`Container selecionado: ${container.localizacao}`);
    navigate('/products');
  };

  if (!condominio) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold">Selecionar Container</h1>
            <Button
              variant="danger"
              onClick={logout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Sair
            </Button>
          </div>
          <p className="text-sm text-gray-600">{condominio.nome}</p>
        </div>
      </div>

      {/* Status Online/Offline */}
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-orange-600" />
              <span className="text-orange-600">Offline - Usando dados salvos</span>
            </>
          )}
        </div>
      </div>

      {/* Lista de Containers */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {isLoading && <Loading message="Carregando containers..." />}

        {!isLoading && containers && containers.length === 0 && (
          <Card>
            <p className="text-center text-gray-500">
              Nenhum container disponível para este condomínio.
            </p>
          </Card>
        )}

        {!isLoading && containers && containers.length > 0 && (
          <div className="space-y-3">
            {containers.map((container) => (
              <Card
                key={container.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectContainer(container)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        {container.localizacao}
                      </h3>
                    </div>
                    {container.descricao && (
                      <p className="text-sm text-gray-600 mb-2">
                        {container.descricao}
                      </p>
                    )}
                    <Badge variant={container.ativo ? 'success' : 'danger'}>
                      {container.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isOnline && (!containers || containers.length === 0) && (
          <Card>
            <p className="text-center text-orange-600">
              Você está offline e não há dados salvos. Conecte-se à internet para continuar.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
