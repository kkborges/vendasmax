import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  const venda = state?.venda;
  const offline = state?.offline;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {offline ? 'Venda Registrada!' : 'Pagamento Aprovado!'}
            </h1>
            <p className="text-gray-600">
              {offline
                ? 'Sua venda foi salva e será sincronizada quando houver conexão.'
                : 'Sua compra foi processada com sucesso.'}
            </p>
          </div>

          {venda && !offline && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-semibold">{venda.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Itens:</span>
                  <span className="font-semibold">{venda.itens?.length || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Pago:</span>
                  <span className="font-bold text-lg text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(venda.valorTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {offline && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Você estava offline durante a venda. Assim que houver conexão, os dados serão automaticamente enviados ao servidor.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => navigate('/products')}
              icon={<ShoppingBag className="w-5 h-5" />}
              fullWidth
            >
              Nova Venda
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/container-select')}
              icon={<Home className="w-5 h-5" />}
              fullWidth
            >
              Voltar ao Início
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
