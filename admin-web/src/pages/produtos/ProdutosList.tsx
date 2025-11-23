import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { produtosService } from '../../services/produtos';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Produto } from '../../types';

export default function ProdutosList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['produtos', page, search],
    queryFn: () => produtosService.list({ page, limit: 20, search }),
  });

  const columns = [
    { key: 'nome', header: 'Produto' },
    {
      key: 'categoria',
      header: 'Categoria',
      render: (item: Produto) => item.categoria?.nome || '-',
    },
    {
      key: 'valorVenda',
      header: 'Valor',
      render: (item: Produto) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(Number(item.valorVenda)),
    },
    {
      key: 'estoque',
      header: 'Estoque',
      render: (item: Produto) => item.estoqueGeral?.quantidade || 0,
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (item: Produto) => (
        <Badge variant={item.ativo ? 'success' : 'default'}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie o catálogo de produtos</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Novo Produto</Button>
      </div>

      <div className="card mb-6">
        <Input
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      <div className="card">
        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
        />
        {data && data.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Página {data.page} de {data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
