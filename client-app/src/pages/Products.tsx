import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { produtosService, ProdutoComEstoque } from '../services/produtos';
import { offlineService } from '../services/offlineDb';
import { useOnline } from '../hooks/useOnline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import BarcodeScanner from '../components/BarcodeScanner';
import {
  Search,
  ShoppingCart,
  Camera,
  Plus,
  Minus,
  ArrowLeft,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const navigate = useNavigate();
  const isOnline = useOnline();
  const { selectedContainer, condominio } = useAuthStore();
  const { addItem, items } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [offlineProdutos, setOfflineProdutos] = useState<ProdutoComEstoque[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Buscar produtos online
  const { data: onlineProdutos, isLoading } = useQuery({
    queryKey: ['produtos', selectedContainer?.id],
    queryFn: () => produtosService.listByContainer(selectedContainer!.id),
    enabled: !!selectedContainer && isOnline,
  });

  // Salvar produtos no cache quando obtidos online
  useEffect(() => {
    if (onlineProdutos && isOnline) {
      offlineService.salvarProdutos(onlineProdutos);
    }
  }, [onlineProdutos, isOnline]);

  // Carregar produtos do cache quando offline
  useEffect(() => {
    if (!isOnline && selectedContainer) {
      offlineService.getProdutos().then(setOfflineProdutos);
    }
  }, [isOnline, selectedContainer]);

  const produtos = isOnline ? onlineProdutos : offlineProdutos;

  // Filtrar produtos pela busca
  const produtosFiltrados = produtos?.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigoBarras?.includes(searchTerm) ||
    p.qrCode?.includes(searchTerm)
  );

  const handleScan = async (code: string) => {
    try {
      const produto = await produtosService.getByCode(code);
      if (produto) {
        setSearchTerm('');
        toast.success(`Produto encontrado: ${produto.nome}`);
        // Auto-adicionar ao carrinho com quantidade 1
        handleAddToCart(produto as ProdutoComEstoque, 1);
      }
    } catch (error) {
      toast.error('Produto não encontrado');
    }
  };

  const handleAddToCart = (produto: ProdutoComEstoque, qty?: number) => {
    const quantity = qty || quantities[produto.id] || 1;

    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (quantity > produto.quantidadeDisponivel) {
      toast.error(`Estoque insuficiente. Disponível: ${produto.quantidadeDisponivel}`);
      return;
    }

    addItem({
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: quantity,
      foto: produto.foto,
    });

    toast.success(`${produto.nome} adicionado ao carrinho`);
    setQuantities({ ...quantities, [produto.id]: 1 });
  };

  const incrementQuantity = (produtoId: string) => {
    setQuantities({
      ...quantities,
      [produtoId]: (quantities[produtoId] || 1) + 1,
    });
  };

  const decrementQuantity = (produtoId: string) => {
    const current = quantities[produtoId] || 1;
    if (current > 1) {
      setQuantities({
        ...quantities,
        [produtoId]: current - 1,
      });
    }
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantidade, 0);

  if (!selectedContainer || !condominio) {
    navigate('/container-select');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate('/container-select')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Produtos</h1>
              <p className="text-xs text-gray-600">{selectedContainer.localizacao}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setScannerOpen(true)}
              icon={<Camera className="w-5 h-5" />}
            />
          </div>
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

      {/* Products List */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {isLoading && <Loading message="Carregando produtos..." />}

        {!isLoading && produtosFiltrados && produtosFiltrados.length === 0 && (
          <Card>
            <p className="text-center text-gray-500">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          {produtosFiltrados?.map((produto) => {
            const qty = quantities[produto.id] || 1;
            return (
              <Card key={produto.id} className="overflow-hidden">
                <div className="flex gap-3">
                  {/* Imagem */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {produto.foto ? (
                      <img
                        src={produto.foto}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{produto.nome}</h3>
                    {produto.categoria && (
                      <Badge variant="info" className="text-xs mt-1">
                        {produto.categoria.nome}
                      </Badge>
                    )}
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(produto.preco)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estoque: {produto.quantidadeDisponivel}
                    </p>
                  </div>
                </div>

                {/* Quantidade e Adicionar */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => decrementQuantity(produto.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{qty}</span>
                    <button
                      onClick={() => incrementQuantity(produto.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleAddToCart(produto)}
                    disabled={!produto.ativo || produto.quantidadeDisponivel === 0}
                    fullWidth
                  >
                    Adicionar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-20">
          <button
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          </button>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
