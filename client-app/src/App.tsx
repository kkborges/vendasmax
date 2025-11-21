import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';

// Proteção de rota
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Placeholder para páginas em desenvolvimento
function PlaceholderPage({ title }: { title: string }) {
  const { condominio, selectedContainer, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h1 className="text-xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">Página em desenvolvimento</p>

          {condominio && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-900">
                Condomínio: {condominio.nome}
              </p>
              {selectedContainer && (
                <p className="text-sm text-blue-700">
                  Container: {selectedContainer.localizacao}
                </p>
              )}
            </div>
          )}

          <button onClick={logout} className="btn btn-danger w-full">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/container-select"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Seleção de Container" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Produtos" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Carrinho" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
