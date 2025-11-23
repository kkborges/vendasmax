import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { vendasService, CriarVendaData } from '../services/vendas';
import { offlineService } from '../services/offlineDb';
import { useOnline } from '../hooks/useOnline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { ArrowLeft, CheckCircle, XCircle, Wifi, WifiOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

type MetodoPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'MAQUININHA';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnline = useOnline();
  const { condominio, selectedContainer } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();

  const metodoPagamento = (location.state as any)?.metodoPagamento as MetodoPagamento;

  const [showPixQrCode, setShowPixQrCode] = useState(false);
  const [pixQrCode, setPixQrCode] = useState('');
  const [vendaId, setVendaId] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Formulário de dados do cliente
  const [customerData, setCustomerData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
  });

  // Formulário de cartão
  const [cardData, setCardData] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
  });

  const total = getTotal();

  // Mutation para criar venda
  const createVendaMutation = useMutation({
    mutationFn: async (data: CriarVendaData) => {
      if (isOnline) {
        return await vendasService.criar(data);
      } else {
        // Salvar offline
        const id = await offlineService.salvarVendaOffline(data);
        toast.info('Venda salva offline. Será sincronizada quando houver conexão.');
        return { id: id.toString(), offline: true };
      }
    },
    onSuccess: (venda: any) => {
      if (venda.offline) {
        // Venda offline
        clearCart();
        navigate('/success', { state: { offline: true } });
      } else if (metodoPagamento === 'PIX' && venda.pagamentos?.[0]?.pixQrCode) {
        // Mostrar QR Code do PIX
        setPixQrCode(venda.pagamentos[0].pixQrCode);
        setVendaId(venda.id);
        setShowPixQrCode(true);
      } else if (venda.status === 'PAGO') {
        // Pagamento aprovado
        clearCart();
        navigate('/success', { state: { venda } });
      } else if (venda.status === 'FALHOU') {
        // Pagamento falhou
        setVendaId(venda.id);
        setTentativas(venda.pagamentos?.[0]?.tentativasRealizadas || 0);

        if (tentativas >= 3) {
          setShowCustomerForm(true);
        } else {
          toast.error('Pagamento falhou. Tente novamente.');
        }
      }
    },
    onError: (error: any) => {
      console.error('Erro ao criar venda:', error);
      toast.error(error.response?.data?.error || 'Erro ao processar pagamento');
    },
  });

  // Mutation para verificar status do PIX
  const checkPixMutation = useMutation({
    mutationFn: () => vendasService.verificarStatusPagamento(vendaId),
    onSuccess: (venda) => {
      if (venda.status === 'PAGO') {
        setShowPixQrCode(false);
        clearCart();
        navigate('/success', { state: { venda } });
      }
    },
  });

  // Verificar status do PIX a cada 5 segundos
  useEffect(() => {
    if (showPixQrCode && vendaId && isOnline) {
      const interval = setInterval(() => {
        checkPixMutation.mutate();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [showPixQrCode, vendaId, isOnline]);

  // Mutation para tentar novamente
  const retryMutation = useMutation({
    mutationFn: (dados?: any) => vendasService.tentarNovamente(vendaId, dados),
    onSuccess: (venda) => {
      if (venda.status === 'PAGO') {
        clearCart();
        navigate('/success', { state: { venda } });
      } else if (venda.status === 'FALHOU') {
        const novasTentativas = venda.pagamentos?.[0]?.tentativasRealizadas || 0;
        setTentativas(novasTentativas);

        if (novasTentativas >= 3) {
          setShowCustomerForm(true);
        } else {
          toast.error('Pagamento falhou novamente. Tente outra vez.');
        }
      }
    },
  });

  const handleSubmit = () => {
    if (!condominio || !selectedContainer || items.length === 0) {
      return;
    }

    const vendaData: CriarVendaData = {
      condominioId: condominio.id,
      containerId: selectedContainer.id,
      itens: items.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: item.preco,
        subtotal: item.preco * item.quantidade,
      })),
      valorTotal: total,
      metodoPagamento,
      gateway: metodoPagamento === 'PIX' ? 'MERCADOPAGO' : 'STRIPE',
    };

    createVendaMutation.mutate(vendaData);
  };

  const handleRetry = () => {
    retryMutation.mutate();
  };

  const handleCustomerSubmit = () => {
    if (!customerData.nome || !customerData.email) {
      toast.error('Preencha ao menos nome e email');
      return;
    }

    retryMutation.mutate(customerData);
  };

  if (!metodoPagamento || items.length === 0) {
    navigate('/checkout');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/checkout')}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Pagamento</h1>
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
              <span className="text-orange-600">
                Offline - Venda será processada quando voltar online
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Resumo */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Total a Pagar</h2>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(total)}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Método: {metodoPagamento === 'PIX' ? 'PIX' : `Cartão de ${metodoPagamento === 'CREDITO' ? 'Crédito' : 'Débito'}`}
          </p>
        </Card>

        {/* Formulário de Cartão (se necessário) */}
        {(metodoPagamento === 'CREDITO' || metodoPagamento === 'DEBITO') && (
          <Card>
            <h2 className="font-semibold mb-3">Dados do Cartão</h2>
            <div className="space-y-3">
              <Input
                label="Número do Cartão"
                placeholder="0000 0000 0000 0000"
                value={cardData.numero}
                onChange={(e) => setCardData({ ...cardData, numero: e.target.value })}
                maxLength={19}
              />
              <Input
                label="Nome no Cartão"
                placeholder="Como está no cartão"
                value={cardData.nome}
                onChange={(e) => setCardData({ ...cardData, nome: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Validade"
                  placeholder="MM/AA"
                  value={cardData.validade}
                  onChange={(e) => setCardData({ ...cardData, validade: e.target.value })}
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  placeholder="000"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  maxLength={4}
                  type="password"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Maquininha */}
        {metodoPagamento === 'MAQUININHA' && (
          <Card>
            <div className="text-center py-4">
              <Clock className="w-12 h-12 mx-auto text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2">Aguardando Maquininha</h3>
              <p className="text-sm text-gray-600">
                Confirme o pagamento na maquininha
              </p>
            </div>
          </Card>
        )}

        {/* Tentativas */}
        {tentativas > 0 && tentativas < 3 && (
          <Card className="bg-orange-50 border-orange-200">
            <p className="text-sm text-orange-800">
              Tentativa {tentativas} de 3. Após 3 tentativas, solicitaremos seus dados para contato.
            </p>
          </Card>
        )}

        {/* Botão Processar */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={createVendaMutation.isLoading}
          fullWidth
        >
          {isOnline ? 'Processar Pagamento' : 'Salvar Venda (Offline)'}
        </Button>

        {vendaId && tentativas > 0 && tentativas < 3 && (
          <Button
            variant="secondary"
            onClick={handleRetry}
            loading={retryMutation.isLoading}
            fullWidth
          >
            Tentar Novamente ({3 - tentativas} restantes)
          </Button>
        )}
      </div>

      {/* Modal PIX QR Code */}
      <Modal
        isOpen={showPixQrCode}
        onClose={() => setShowPixQrCode(false)}
        title="Pagar com PIX"
      >
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
              {pixQrCode ? (
                <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX" />
              ) : (
                <p className="text-gray-500">Gerando QR Code...</p>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Escaneie o QR Code com seu aplicativo de banco
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Aguardando pagamento...</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Formulário de Dados do Cliente */}
      <Modal
        isOpen={showCustomerForm}
        onClose={() => {}}
        title="Dados para Contato"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            O pagamento falhou 3 vezes. Por favor, informe seus dados para que possamos entrar em contato.
          </p>

          <Input
            label="Nome Completo *"
            value={customerData.nome}
            onChange={(e) => setCustomerData({ ...customerData, nome: e.target.value })}
          />
          <Input
            label="Email *"
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
          />
          <Input
            label="Telefone"
            value={customerData.telefone}
            onChange={(e) => setCustomerData({ ...customerData, telefone: e.target.value })}
          />
          <Input
            label="CPF"
            value={customerData.cpf}
            onChange={(e) => setCustomerData({ ...customerData, cpf: e.target.value })}
          />

          <Button
            variant="primary"
            onClick={handleCustomerSubmit}
            loading={retryMutation.isLoading}
            fullWidth
          >
            Enviar e Tentar Novamente
          </Button>
        </div>
      </Modal>
    </div>
  );
}
