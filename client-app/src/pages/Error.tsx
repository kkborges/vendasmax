import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Error() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  const errorMessage = state?.message || 'Ocorreu um erro inesperado';
  const canRetry = state?.canRetry !== false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600">{errorMessage}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              {state?.details ||
                'Por favor, tente novamente. Se o problema persistir, entre em contato com o suporte.'}
            </p>
          </div>

          <div className="space-y-3">
            {canRetry && (
              <Button
                variant="primary"
                onClick={() => navigate(-1)}
                icon={<RefreshCw className="w-5 h-5" />}
                fullWidth
              >
                Tentar Novamente
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate('/container-select')}
              icon={<ArrowLeft className="w-5 h-5" />}
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
