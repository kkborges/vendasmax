import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const handleUpdateQuantity = (produtoId: string, delta: number) => {
    const item = items.find((i) => i.produtoId === produtoId);
    if (item) {
      const newQuantity = item.quantidade + delta;
      if (newQuantity > 0) {
        updateQuantity(produtoId, newQuantity);
      }
    }
  };

  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/products')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Carrinho</h1>
              <p className="text-xs text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="danger"
                onClick={clearCart}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {items.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Carrinho vazio
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Adicione produtos para continuar
              </p>
              <Button onClick={() => navigate('/products')}>
                Ver Produtos
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <Card key={item.produtoId}>
                  <div className="flex gap-3">
                    {/* Imagem */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {item.nome}
                        </h3>
                        <button
                          onClick={() => removeItem(item.produtoId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.preco)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantidade */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.produtoId, -1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.produtoId, 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="font-bold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(item.preco * item.quantidade)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Total */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(total)}
                  </p>
                </div>
                <Button variant="primary" onClick={() => navigate('/checkout')}>
                  Finalizar Compra
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
