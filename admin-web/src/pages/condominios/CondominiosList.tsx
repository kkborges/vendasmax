import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileX } from 'lucide-react';
import { condominiosService } from '../../services/condominios';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Condominio } from '../../types';

export default function CondominiosList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['condominios', page, search],
    queryFn: () => condominiosService.list({ page, limit: 10, search }),
  });

  const handleDelete = async (id: string) => {
    try {
      await condominiosService.delete(id);
      toast.success('Condomínio excluído com sucesso');
      refetch();
      setDeleteModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao excluir condomínio');
    }
  };

  const handleRescindir = async (id: string) => {
    try {
      await condominiosService.rescindirContrato(id);
      toast.success('Contrato rescindido com sucesso');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao rescindir contrato');
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'cnpj', header: 'CNPJ' },
    {
      key: 'cidade',
      header: 'Cidade/UF',
      render: (item: Condominio) => `${item.cidade} - ${item.estado}`,
    },
    {
      key: 'totalBlocos',
      header: 'Blocos',
      render: (item: Condominio) => item.totalBlocos,
    },
    {
      key: 'totalApartamentos',
      header: 'Aptos',
      render: (item: Condominio) => item.totalApartamentos,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Condominio) => (
        <div className="flex gap-2">
          {item.contratoRescindido ? (
            <Badge variant="danger">Rescindido</Badge>
          ) : item.ativo ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="default">Inativo</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: Condominio) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/condominios/${item.id}`);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!item.contratoRescindido && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      'Deseja rescindir o contrato deste condomínio?'
                    )
                  ) {
                    handleRescindir(item.id);
                  }
                }}
                className="text-orange-600 hover:text-orange-800"
              >
                <FileX className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal(item.id);
                }}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Condomínios</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os condomínios cadastrados
          </p>
        </div>
        <Button
          onClick={() => navigate('/condominios/novo')}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Condomínio
        </Button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="Nenhum condomínio encontrado"
        />

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {data.page} de {data.totalPages} ({data.total} registros)
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

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Excluir Condomínio"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModal && handleDelete(deleteModal)}
            >
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Tem certeza que deseja excluir este condomínio? Esta ação não pode
          ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
