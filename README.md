# VendasMax - Sistema de Gestão de Vendas para Condomínios

Sistema completo de gerenciamento de vendas em containers para condomínios, com funcionalidades de vendas offline, integração com gateways de pagamento, gestão de estoque e análises preditivas.

## 🏗️ Arquitetura do Projeto

Este é um monorepo que contém:

- **backend**: API RESTful Node.js/Express com TypeScript
- **admin-web**: Painel administrativo React/TypeScript
- **client-app**: Aplicativo de vendas PWA React/TypeScript (com modo offline)
- **shared**: Tipos e utilitários compartilhados
- **docs**: Documentação do projeto

## 🚀 Funcionalidades Principais

### Painel Administrativo
- ✅ CRUD completo de Condomínios
- ✅ CRUD completo de Containers
- ✅ CRUD completo de Produtos e Categorias
- ✅ Gestão de estoque geral e por container
- ✅ Relatórios analíticos (semanais, quinzenais, mensais, por período)
- ✅ Monitoramento de vendas e histórico de erros
- ✅ Gestão de pagamentos pendentes
- ✅ Controle de validade de produtos
- ✅ Notificações de estoque mínimo
- ✅ Sugestões inteligentes de compras (ML)

### Aplicativo de Vendas
- ✅ Modo offline com sincronização automática
- ✅ Carrinho de compras
- ✅ Leitor de código de barras/QR code
- ✅ Múltiplas formas de pagamento (PIX, Cartão de Crédito/Débito)
- ✅ Integração com gateways (Stripe, Mercado Pago)
- ✅ Integração com maquininhas de cartão
- ✅ Sistema de tentativas de pagamento (3x)
- ✅ Coleta de dados para cobrança manual (opcional)
- ✅ Interface responsiva

## 🛠️ Tecnologias

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (cache e filas)
- JWT (autenticação)
- Stripe SDK
- Mercado Pago SDK

### Frontend
- React 18+
- TypeScript
- Material-UI / Ant Design
- React Query
- Zustand (estado global)
- Service Workers (PWA)
- IndexedDB (modo offline)
- React-QR-Reader

### DevOps
- Docker & Docker Compose
- Nginx
- GitHub Actions (CI/CD)

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (opcional)

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar banco de dados (Docker)
docker-compose up -d postgres redis

# Executar migrações
npm run db:migrate

# Iniciar desenvolvimento
npm run dev
```

## 🏃 Comandos

```bash
# Desenvolvimento
npm run dev              # Inicia todos os serviços em modo dev
npm run dev:backend      # Apenas backend
npm run dev:admin        # Apenas painel admin
npm run dev:client       # Apenas app de vendas

# Build
npm run build            # Build de todos os projetos
npm run build:backend    # Build backend
npm run build:admin      # Build admin
npm run build:client     # Build client

# Testes
npm test                 # Executar todos os testes
npm run test:backend     # Testes do backend
npm run test:admin       # Testes do admin
npm run test:client      # Testes do client

# Database
npm run db:migrate       # Executar migrações
npm run db:seed          # Popular banco com dados de exemplo
npm run db:studio        # Abrir Prisma Studio
```

## 📊 Estrutura do Banco de Dados

### Entidades Principais
- **Condomínio**: Dados do condomínio (CNPJ, endereço, etc)
- **Container**: Containers vinculados a condomínios
- **Categoria**: Categorias de produtos
- **Produto**: Produtos com estoque geral
- **ContainerEstoque**: Estoque específico por container
- **Venda**: Registro de vendas
- **VendaItem**: Itens de cada venda
- **Pagamento**: Pagamentos e tentativas
- **Notificação**: Histórico de notificações
- **LogErro**: Logs de erros e problemas

## 🔐 Segurança

- Autenticação JWT
- Bcrypt para senhas
- HTTPS/SSL obrigatório em produção
- Validação de dados com Zod
- Rate limiting
- CORS configurado
- Sanitização de inputs
- Logs de auditoria

## 📱 PWA - Modo Offline

O aplicativo de vendas funciona completamente offline:
- Cache de produtos e imagens
- Armazenamento local de vendas
- Sincronização automática ao retornar online
- Fila de pagamentos pendentes
- Notificação de status de conectividade

## 🔔 Sistema de Notificações

- Email (SendGrid)
- SMS (Twilio)
- WhatsApp (Twilio/WhatsApp Business API)

Notificações automáticas para:
- Estoque mínimo atingido
- Produtos próximos do vencimento (3 dias)
- Falhas de comunicação com serviços
- Pagamentos pendentes

## 📈 Análise Preditiva

Sistema de ML para sugestão de compras baseado em:
- Histórico de vendas por container
- Sazonalidade
- Tendências de consumo
- Taxa de crescimento
- Produtos mais vendidos

## 📝 Licença

Proprietary - Todos os direitos reservados

## 👥 Autores

VendasMax Team

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@vendasmax.com.br
