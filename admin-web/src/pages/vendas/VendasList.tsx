import { useState } from 'react';
import { useQuery } from '@tantml:parameter>
import { Search } from 'lucide-react';
import { vendasService } from '../../services/vendas';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Venda } from '../../types';

export default function VendasList() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['vendas', page],
    queryFn: () => vendasService.list({ page, limit: 20 }),
  });

  const columns = [
    { key: 'numeroVenda', header: 'Número' },
    {
      key: 'condominio',
      header: 'Condomínio',
      render: (item: Venda) => item.container?.condominio?.nome || '-',
    },
    {
      key: 'valorTotal',
      header: 'Valor',
      render: (item: Venda) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(Number(item.valorTotal)),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Venda) => {
        const variants = {
          PAGO: 'success' as const,
          PENDENTE: 'warning' as const,
          CANCELADO: 'danger' as const,
          PARCIAL: 'info' as const,
        };
        return <Badge variant={variants[item.status]}>{item.status}</Badge>;
      },
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (item: Venda) =>
        new Date(item.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <p className="text-gray-600 mt-1">Visualize todas as vendas realizadas</p>
      </div>

      <div className="card">
        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
