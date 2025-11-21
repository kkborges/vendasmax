import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { DashboardData } from '../types';
import {
  Building2,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/relatorios/dashboard');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Erro ao carregar dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Condomínios',
      value: data?.resumo.totalCondominios || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'Containers',
      value: data?.resumo.totalContainers || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Produtos',
      value: data?.resumo.totalProdutos || 0,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      name: 'Vendas (30 dias)',
      value: data?.resumo.totalVendas || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      name: 'Vendas Pendentes',
      value: data?.resumo.vendasPendentes || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      name: 'Faturamento (30 dias)',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(data?.resumo.valorTotalUltimos30Dias || 0),
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.resumo.vendasHoje !== undefined && (
        <div className="mt-6 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Vendas Hoje
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.resumo.vendasHoje}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            vendas realizadas hoje
          </p>
        </div>
      )}
    </div>
  );
}
