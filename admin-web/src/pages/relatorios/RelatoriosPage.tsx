import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { relatoriosService } from '../../services/relatorios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FileText } from 'lucide-react';

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);

  const { data: relatorio, isLoading } = useQuery({
    queryKey: ['relatorio-vendas', dataInicio, dataFim],
    queryFn: () => relatoriosService.vendas({ dataInicio, dataFim }),
    enabled: mostrarRelatorio && !!dataInicio && !!dataFim,
  });

  const handleGerar = () => {
    if (!dataInicio || !dataFim) {
      alert('Preencha as datas');
      return;
    }
    setMostrarRelatorio(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-gray-600 mt-1">Visualize relatórios analíticos</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Relatório de Vendas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Data Início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <Input
            label="Data Fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={handleGerar}
              icon={<FileText className="w-4 h-4" />}
              loading={isLoading}
            >
              Gerar Relatório
            </Button>
          </div>
        </div>
      </div>

      {mostrarRelatorio && relatorio && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Resumo</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-blue-600">
                {relatorio.resumo.totalVendas}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(relatorio.resumo.valorTotal)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(relatorio.resumo.ticketMedio)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
