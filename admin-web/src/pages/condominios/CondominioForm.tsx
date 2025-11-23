import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { condominiosService } from '../../services/condominios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CondominioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: '',
    nome: '',
    rua: '',
    cep: '',
    bairro: '',
    cidade: '',
    estado: '',
    totalBlocos: 1,
    totalApartamentos: 10,
    usuario: '',
    senha: '',
  });

  const { data: condominio } = useQuery({
    queryKey: ['condominio', id],
    queryFn: () => condominiosService.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (condominio) {
      setFormData({
        cnpj: condominio.cnpj,
        nome: condominio.nome,
        rua: condominio.rua,
        cep: condominio.cep,
        bairro: condominio.bairro,
        cidade: condominio.cidade,
        estado: condominio.estado,
        totalBlocos: condominio.totalBlocos,
        totalApartamentos: condominio.totalApartamentos,
        usuario: condominio.usuario || '',
        senha: '',
      });
    }
  }, [condominio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await condominiosService.update(id, formData);
        toast.success('Condomínio atualizado com sucesso');
      } else {
        await condominiosService.create(formData);
        toast.success('Condomínio criado com sucesso');
      }
      navigate('/condominios');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar condomínio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/condominios')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Condomínio' : 'Novo Condomínio'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Condomínio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CNPJ *"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              required
              placeholder="00.000.000/0000-00"
            />
            <Input
              label="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
            <Input
              label="Rua/Avenida *"
              value={formData.rua}
              onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
              required
            />
            <Input
              label="CEP *"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              required
              placeholder="00000-000"
            />
            <Input
              label="Bairro *"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              required
            />
            <Input
              label="Cidade *"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              required
            />
            <Input
              label="Estado *"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              required
              maxLength={2}
              placeholder="SP"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Total de Blocos *"
                type="number"
                value={formData.totalBlocos}
                onChange={(e) =>
                  setFormData({ ...formData, totalBlocos: parseInt(e.target.value) })
                }
                required
                min={1}
              />
              <Input
                label="Total de Apartamentos *"
                type="number"
                value={formData.totalApartamentos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalApartamentos: parseInt(e.target.value),
                  })
                }
                required
                min={1}
              />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Acesso ao Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Usuário"
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
              helperText="Usado para login no app de vendas"
            />
            <Input
              label={id ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              helperText="Usado para login no app de vendas"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
            {id ? 'Atualizar' : 'Criar'} Condomínio
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/condominios')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
