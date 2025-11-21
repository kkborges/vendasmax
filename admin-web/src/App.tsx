import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/layout/AppLayout';

// Componente de proteção de rota
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Páginas placeholder (para não quebrar a navegação)
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="card">
        <p className="text-gray-600">
          Página em desenvolvimento. Implementação em andamento.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="condominios"
          element={<PlaceholderPage title="Condomínios" />}
        />
        <Route
          path="containers"
          element={<PlaceholderPage title="Containers" />}
        />
        <Route
          path="produtos"
          element={<PlaceholderPage title="Produtos" />}
        />
        <Route
          path="vendas"
          element={<PlaceholderPage title="Vendas" />}
        />
        <Route
          path="relatorios"
          element={<PlaceholderPage title="Relatórios" />}
        />
        <Route
          path="configuracoes"
          element={<PlaceholderPage title="Configurações" />}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
