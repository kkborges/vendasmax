import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { ShoppingCart, Wifi, WifiOff } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isOnline = useOnline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error('Sem conexão com internet. Conecte-se para fazer login.');
      return;
    }

    if (!usuario || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(usuario, senha);
      toast.success('Login realizado!');
      navigate('/container-select');
    } catch (error) {
      // Erro já tratado
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 p-4">
      <div className="max-w-md w-full">
        {/* Status de conexão */}
        <div className="mb-4 flex items-center justify-center">
          <div
            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              isOnline
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 mr-1.5" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1.5" />
                Offline
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VendasMax</h1>
            <p className="text-gray-600 mt-1">Aplicativo de Vendas</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário do Condomínio
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="input"
                placeholder="usuario_condominio"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isOnline}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              Use as credenciais fornecidas pelo administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
