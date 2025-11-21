# VendasMax - Painel Administrativo

Painel administrativo para gerenciamento do sistema VendasMax.

## Tecnologias

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- TanStack Query (React Query)
- Zustand (state management)
- React Hook Form + Zod
- Recharts (gráficos)
- Lucide React (ícones)
- Axios

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI base
│   ├── layout/         # Layout (Sidebar, Header, etc)
│   ├── forms/          # Componentes de formulário
│   └── tables/         # Componentes de tabela
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── condominios/    # Gestão de condomínios
│   ├── containers/     # Gestão de containers
│   ├── produtos/       # Gestão de produtos
│   ├── estoque/        # Gestão de estoque
│   ├── vendas/         # Gestão de vendas
│   └── relatorios/     # Relatórios
├── services/           # Serviços de API
│   ├── api.ts          # Cliente axios configurado
│   ├── auth.ts         # Serviços de autenticação
│   ├── condominios.ts  # Serviços de condomínios
│   ├── containers.ts   # Serviços de containers
│   ├── produtos.ts     # Serviços de produtos
│   ├── vendas.ts       # Serviços de vendas
│   └── relatorios.ts   # Serviços de relatórios
├── stores/             # Zustand stores
│   ├── authStore.ts    # Store de autenticação
│   └── appStore.ts     # Store global
├── hooks/              # Custom hooks
│   ├── useAuth.ts      # Hook de autenticação
│   └── useDebounce.ts  # Hook de debounce
├── types/              # TypeScript types
│   └── index.ts        # Tipos da aplicação
├── utils/              # Utilitários
│   ├── format.ts       # Formatadores
│   └── validation.ts   # Validações
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## Funcionalidades

### Autenticação
- Login com email e senha
- JWT armazenado no localStorage
- Auto-logout em caso de token inválido
- Proteção de rotas

### Dashboard
- Resumo de vendas
- Gráficos de vendas por período
- Produtos mais vendidos
- Alertas de estoque baixo
- Produtos próximos do vencimento

### Gestão de Condomínios
- Listar condomínios (paginado)
- Criar novo condomínio
- Editar condomínio
- Desativar condomínio
- Rescindir contrato
- Visualizar containers do condomínio

### Gestão de Containers
- Listar containers
- Criar container
- Editar container
- Deletar container
- Visualizar estoque do container
- Gerenciar estoque por container

### Gestão de Produtos
- Listar produtos (paginado, com busca e filtros)
- Criar produto
- Editar produto
- Desativar produto
- Upload de foto
- Código de barras / QR Code
- Gestão de categorias

### Gestão de Estoque
- Visualizar estoque geral
- Visualizar estoque por container
- Movimentar estoque entre containers
- Entrada de produtos
- Ajustes de estoque
- Alertas de estoque mínimo
- Controle de validade

### Gestão de Vendas
- Listar vendas
- Visualizar detalhes da venda
- Filtrar por status, container, período
- Atualizar status de pagamento
- Cancelar venda
- Histórico de pagamentos
- Logs de erros

### Relatórios
- **Vendas**: Total, ticket médio, produtos mais vendidos
- **Estoque**: Valor total, produtos em falta, produtos vencendo
- **Financeiro**: Receita, custo, lucro, margem
- Exportar relatórios (CSV, PDF)
- Gráficos interativos
- Filtros por período

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=VendasMax Admin
```

## Rotas

- `/` - Redireciona para Dashboard ou Login
- `/login` - Página de login
- `/dashboard` - Dashboard principal
- `/condominios` - Listagem de condomínios
- `/condominios/novo` - Criar condomínio
- `/condominios/:id` - Editar condomínio
- `/containers` - Listagem de containers
- `/containers/novo` - Criar container
- `/containers/:id` - Editar container
- `/containers/:id/estoque` - Estoque do container
- `/produtos` - Listagem de produtos
- `/produtos/novo` - Criar produto
- `/produtos/:id` - Editar produto
- `/estoque` - Gestão de estoque
- `/vendas` - Listagem de vendas
- `/vendas/:id` - Detalhes da venda
- `/relatorios` - Relatórios

## Componentes Principais

### Layout
- `Sidebar`: Menu lateral com navegação
- `Header`: Cabeçalho com informações do usuário
- `ProtectedRoute`: Proteção de rotas autenticadas

### UI Components
- `Button`: Botão com variantes
- `Input`: Input com validação
- `Select`: Select customizado
- `Table`: Tabela com paginação
- `Modal`: Modal reutilizável
- `Card`: Card container
- `Badge`: Badge para status
- `Loading`: Loading spinner
- `Alert`: Mensagens de alerta

### Forms
- `CondominioForm`: Formulário de condomínio
- `ContainerForm`: Formulário de container
- `ProdutoForm`: Formulário de produto
- `EstoqueForm`: Formulário de estoque

## Estado Global (Zustand)

### authStore
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}
```

## Serviços de API

Todos os serviços usam axios com interceptors para:
- Adicionar token JWT automaticamente
- Tratar erros globalmente
- Redirecionar para login em caso de 401

### Exemplo de uso:

```typescript
import { produtosService } from '@/services/produtos';

const produtos = await produtosService.list({ page: 1, limit: 20 });
const produto = await produtosService.getById(id);
await produtosService.create(data);
await produtosService.update(id, data);
await produtosService.delete(id);
```

## Permissões

- **ADMIN**: Acesso total
- **OPERADOR**: Pode gerenciar, mas não deletar
- **VENDEDOR**: Apenas leitura (não usa admin)

## Build e Deploy

```bash
# Build
npm run build

# Os arquivos estarão em dist/
# Deploy para servidor web (Nginx, Apache, etc)

# Configurar .env para produção
VITE_API_URL=https://api.vendasmax.com.br
```

## Nginx Config

```nginx
server {
    listen 80;
    server_name admin.vendasmax.com.br;
    root /var/www/vendasmax-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## Desenvolvimento

### Adicionar nova página

1. Criar componente em `src/pages/`
2. Adicionar rota no `App.tsx`
3. Adicionar link na `Sidebar`
4. Criar serviço se necessário

### Adicionar novo componente UI

1. Criar em `src/components/ui/`
2. Exportar no index
3. Documentar props com TypeScript

## Testes

```bash
# Rodar testes (quando implementados)
npm test

# Coverage
npm run test:coverage
```

## Melhorias Futuras

- [ ] Implementar testes (Jest + React Testing Library)
- [ ] Adicionar Storybook para componentes
- [ ] Implementar i18n (múltiplos idiomas)
- [ ] Dark mode
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de relatórios em PDF
- [ ] Gráficos mais avançados
- [ ] Auditoria e logs mais detalhados
- [ ] Permissões granulares por feature
