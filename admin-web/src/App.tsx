import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CondominiosList from './pages/condominios/CondominiosList';
import CondominioForm from './pages/condominios/CondominioForm';
import ContainersList from './pages/containers/ContainersList';
import ProdutosList from './pages/produtos/ProdutosList';
import VendasList from './pages/vendas/VendasList';
import RelatoriosPage from './pages/relatorios/RelatoriosPage';
import AppLayout from './components/layout/AppLayout';

// Componente de proteção de rota
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
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

        {/* Condomínios */}
        <Route path="condominios" element={<CondominiosList />} />
        <Route path="condominios/novo" element={<CondominioForm />} />
        <Route path="condominios/:id" element={<CondominioForm />} />

        {/* Containers */}
        <Route path="containers" element={<ContainersList />} />

        {/* Produtos */}
        <Route path="produtos" element={<ProdutosList />} />

        {/* Vendas */}
        <Route path="vendas" element={<VendasList />} />

        {/* Relatórios */}
        <Route path="relatorios" element={<RelatoriosPage />} />

        {/* Configurações - Placeholder */}
        <Route
          path="configuracoes"
          element={
            <div>
              <h1 className="text-2xl font-bold">Configurações</h1>
              <p className="text-gray-600 mt-2">Página em desenvolvimento</p>
            </div>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
