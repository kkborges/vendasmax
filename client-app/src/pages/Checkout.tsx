import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, CreditCard, Smartphone, Wallet } from 'lucide-react';

type MetodoPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'MAQUININHA';

export default function Checkout() {
  const navigate = useNavigate();
  const { condominio, selectedContainer } = useAuthStore();
  const { items, getTotal } = useCartStore();
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('PIX');

  const total = getTotal();

  const handleContinue = () => {
    if (!metodoPagamento) {
      return;
    }

    navigate('/payment', {
      state: { metodoPagamento },
    });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/cart')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Finalizar Compra</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Resumo da Venda */}
        <Card>
          <h2 className="font-semibold mb-3">Resumo do Pedido</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Condomínio:</span>
              <span className="font-medium">{condominio?.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Container:</span>
              <span className="font-medium">{selectedContainer?.localizacao}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Itens:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(total)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Produtos */}
        <Card>
          <h2 className="font-semibold mb-3">Itens ({items.length})</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.produtoId} className="flex justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-gray-500">
                    {item.quantidade}x {' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.preco)}
                  </p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.preco * item.quantidade)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Método de Pagamento */}
        <Card>
          <h2 className="font-semibold mb-3">Método de Pagamento</h2>
          <div className="space-y-2">
            <button
              onClick={() => setMetodoPagamento('PIX')}
              className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                metodoPagamento === 'PIX'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMetodoPagamento('CREDITO')}
              className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                metodoPagamento === 'CREDITO'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-sm text-gray-600">Parcelamento disponível</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMetodoPagamento('DEBITO')}
              className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                metodoPagamento === 'DEBITO'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium">Cartão de Débito</p>
                  <p className="text-sm text-gray-600">Débito em conta</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMetodoPagamento('MAQUININHA')}
              className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                metodoPagamento === 'MAQUININHA'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium">Maquininha</p>
                  <p className="text-sm text-gray-600">Pagamento presencial</p>
                </div>
              </div>
            </button>
          </div>
        </Card>

        {/* Botão Continuar */}
        <Button
          variant="primary"
          onClick={handleContinue}
          fullWidth
          disabled={!metodoPagamento}
        >
          Continuar para Pagamento
        </Button>
      </div>
    </div>
  );
}
