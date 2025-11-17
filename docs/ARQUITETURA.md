# Arquitetura do Sistema - VendasMax

## Visão Geral

VendasMax é um sistema completo de gestão de vendas para condomínios com containers de produtos, desenvolvido em uma arquitetura de monorepo com três aplicações principais:

- **Backend API**: API RESTful Node.js/Express com TypeScript
- **Admin Web**: Painel administrativo React/TypeScript
- **Client App**: Aplicativo de vendas PWA React/TypeScript

## Arquitetura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                      VendasMax System                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Admin Web      │    │   Client App     │    │  Mobile Devices  │
│   (React/TS)     │    │   (PWA React)    │    │   (PWA)          │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │   HTTPS/SSL │
                          └──────┬──────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Backend API           │
                    │   (Express/TypeScript)  │
                    │   - REST API            │
                    │   - JWT Auth            │
                    │   - Business Logic      │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼────┐            ┌────▼────┐           ┌─────▼─────┐
    │PostgreSQL│            │  Redis  │           │  External │
    │  (DB)    │            │ (Cache) │           │  Services │
    └──────────┘            └─────────┘           └───────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                              ┌─────▼────┐  ┌─────▼────┐  ┌─────▼────┐
                              │  Stripe  │  │Mercado   │  │ Twilio   │
                              │          │  │  Pago    │  │SendGrid  │
                              └──────────┘  └──────────┘  └──────────┘
```

## Componentes do Sistema

### 1. Backend API

#### Estrutura de Diretórios
```
backend/
├── src/
│   ├── controllers/      # Lógica de controle das rotas
│   ├── models/           # (Prisma gera os modelos)
│   ├── routes/           # Definição das rotas
│   ├── middleware/       # Middlewares (auth, error handling)
│   ├── services/         # Lógica de negócio e integrações
│   ├── utils/            # Utilitários (JWT, validações)
│   ├── config/           # Configurações (DB, Redis, Logger)
│   └── index.ts          # Ponto de entrada da aplicação
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── seed.ts           # Dados iniciais
└── package.json
```

#### Tecnologias
- **Express**: Framework web
- **Prisma**: ORM para PostgreSQL
- **JWT**: Autenticação stateless
- **Bcrypt**: Hash de senhas
- **Winston**: Logging estruturado
- **IORedis**: Cliente Redis
- **Node-cron**: Agendamento de tarefas

#### Principais Rotas

```
POST   /api/auth/login/admin           - Login de administrador
POST   /api/auth/login/condominio      - Login de condomínio
POST   /api/auth/registro              - Registro de usuário

GET    /api/condominios                - Listar condomínios
POST   /api/condominios                - Criar condomínio
GET    /api/condominios/:id            - Buscar condomínio
PUT    /api/condominios/:id            - Atualizar condomínio
DELETE /api/condominios/:id            - Deletar condomínio

GET    /api/containers                 - Listar containers
POST   /api/containers                 - Criar container
GET    /api/containers/:id/estoque     - Buscar estoque do container

GET    /api/produtos                   - Listar produtos
POST   /api/produtos                   - Criar produto
GET    /api/produtos/codigo/:codigo    - Buscar por código de barras

POST   /api/vendas                     - Criar venda
POST   /api/vendas/sincronizar         - Sincronizar vendas offline
GET    /api/vendas/:id                 - Buscar venda

POST   /api/pagamentos                 - Processar pagamento
GET    /api/pagamentos/:id/verificar   - Verificar status do pagamento

GET    /api/relatorios/dashboard       - Dashboard geral
GET    /api/relatorios/vendas          - Relatório de vendas
GET    /api/relatorios/estoque         - Relatório de estoque
GET    /api/relatorios/financeiro      - Relatório financeiro
```

### 2. Banco de Dados (PostgreSQL)

#### Principais Tabelas

**Usuários e Autenticação**
- `usuarios`: Usuários do sistema admin

**Negócio**
- `condominios`: Condomínios cadastrados
- `containers`: Containers de produtos
- `categorias`: Categorias de produtos
- `produtos`: Produtos disponíveis

**Estoque**
- `estoque_geral`: Estoque central
- `container_estoque`: Estoque por container
- `movimentacao_estoque`: Histórico de movimentações

**Vendas e Pagamentos**
- `vendas`: Registro de vendas
- `venda_itens`: Itens de cada venda
- `pagamentos`: Pagamentos realizados
- `pagamento_historico`: Histórico de tentativas

**Operacional**
- `notificacoes`: Notificações enviadas
- `status_servicos`: Status dos serviços
- `log_vendas`: Logs de auditoria

**Análise**
- `analise_vendas`: Dados para ML
- `sugestoes_compra`: Sugestões geradas por ML

### 3. Cache e Filas (Redis)

#### Uso do Redis
- **Cache**: Dados frequentemente acessados (produtos, categorias)
- **Sessões**: Armazenamento de sessões de usuários
- **Filas**: Processamento assíncrono de notificações
- **Rate Limiting**: Controle de taxa de requisições

### 4. Serviços Externos

#### Pagamentos
- **Stripe**: Pagamentos com cartão de crédito/débito
- **Mercado Pago**: PIX e cartão

#### Notificações
- **SendGrid**: Envio de emails
- **Twilio**: SMS e WhatsApp

#### Armazenamento
- **AWS S3**: Armazenamento de imagens de produtos

## Fluxos Principais

### Fluxo de Venda

```
1. Cliente seleciona produtos no app
   ↓
2. Adiciona ao carrinho
   ↓
3. Finaliza compra
   ↓
4. Sistema verifica estoque
   ↓
5. Cria registro de venda (status: PENDENTE)
   ↓
6. Processa pagamento (até 3 tentativas)
   ↓
7a. Pagamento aprovado
    → Atualiza venda (status: PAGO)
    → Baixa estoque
    → Envia notificação
   ↓
7b. Pagamento recusado/erro
    → Marca como pendente
    → Registra erro
    → Coleta dados do cliente (opcional)
    → Notifica admin
```

### Fluxo de Sincronização Offline

```
1. App perde conexão
   ↓
2. Vendas são armazenadas no IndexedDB
   ↓
3. App detecta retorno da conexão
   ↓
4. Envia vendas pendentes para API
   ↓
5. API valida e processa cada venda
   ↓
6. Retorna status de cada sincronização
   ↓
7. App limpa vendas sincronizadas
```

### Fluxo de Notificações

```
1. Sistema detecta condição
   (estoque baixo, produto vencendo, etc)
   ↓
2. Cria registro na tabela notificacoes
   ↓
3. Serviço de notificação processa
   ↓
4. Envia via Email/SMS/WhatsApp
   ↓
5. Atualiza status da notificação
```

## Segurança

### Autenticação e Autorização
- JWT com expiração configurável
- Bcrypt para hash de senhas (salt rounds: 10)
- Roles: ADMIN, OPERADOR, VENDEDOR

### Proteções
- **Rate Limiting**: Máximo de requisições por IP
- **Helmet**: Headers de segurança HTTP
- **CORS**: Origem configurável
- **Input Validation**: Validação com Zod
- **SQL Injection**: Prevenção via Prisma ORM
- **XSS**: Sanitização de inputs

## Performance

### Otimizações
- **Compressão**: Gzip para respostas
- **Cache**: Redis para dados frequentes
- **Índices**: Banco de dados otimizado
- **Paginação**: Todas as listagens paginadas
- **Lazy Loading**: Imagens carregadas sob demanda

### Monitoramento
- **Logs estruturados**: Winston com níveis configuráveis
- **Health checks**: Endpoint /api/health
- **Métricas**: Tempo de resposta, erros, etc

## Escalabilidade

### Horizontal
- Backend stateless (pode ter múltiplas instâncias)
- Redis para compartilhar estado
- Load balancer (Nginx/HAProxy)

### Vertical
- Pool de conexões do banco otimizado
- Workers para processamento assíncrono
- Cache agressivo para reduzir consultas

## Backup e Recuperação

### Estratégias
- **Banco de Dados**: Backup diário automático (pg_dump)
- **Imagens**: Versionamento no S3
- **Logs**: Rotação e arquivamento
- **Redis**: Persistência RDB

### Disaster Recovery
- Snapshots regulares
- Replicação do banco de dados
- Documentação de procedimentos

## Desenvolvimento

### Workflow
1. Criar branch de feature
2. Desenvolver e testar localmente
3. Criar Pull Request
4. Code review
5. Merge para main
6. Deploy automático (CI/CD)

### Testes
- **Unit**: Testes de funções individuais
- **Integration**: Testes de APIs
- **E2E**: Testes de fluxos completos

## Roadmap Futuro

- [ ] Implementação de ML para previsão de vendas
- [ ] App mobile nativo (React Native)
- [ ] Integração com mais gateways de pagamento
- [ ] Dashboard de analytics avançado
- [ ] API GraphQL
- [ ] Suporte a múltiplos idiomas
- [ ] Sistema de fidelidade
- [ ] Cupons e promoções
