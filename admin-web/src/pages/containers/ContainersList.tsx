import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { containersService } from '../../services/containers';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import { Container } from '../../types';

export default function ContainersList() {
  const { data: containers, isLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: () => containersService.list(),
  });

  const columns = [
    { key: 'localizacao', header: 'Localização' },
    {
      key: 'condominio',
      header: 'Condomínio',
      render: (item: Container) => item.condominio?.nome || '-',
    },
    { key: 'bloco', header: 'Bloco' },
    { key: 'espaco', header: 'Espaço' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Containers</h1>
          <p className="text-gray-600 mt-1">Gerencie os containers</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Novo Container</Button>
      </div>

      <div className="card">
        <Table
          data={containers || []}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
