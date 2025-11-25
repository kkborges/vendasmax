# 🚀 Guia Rápido de Inicialização

Este guia irá te ajudar a configurar e executar o projeto VendasMax localmente em poucos minutos.

## ✅ Checklist de Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop/)
- [ ] **Git** - [Download](https://git-scm.com/)

## 📦 Passo 1: Clonar e Instalar Dependências

```bash
# Clonar o repositório (se ainda não fez)
git clone <url-do-repositorio>
cd vendasmax

# Instalar dependências de todas as aplicações
npm install

# OU instalar individualmente
cd backend && npm install
cd ../admin-web && npm install
cd ../client-app && npm install
```

## 🐳 Passo 2: Iniciar Banco de Dados (Docker)

```bash
# Voltar para raiz do projeto
cd /home/user/vendasmax

# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Verificar se os containers estão rodando
docker-compose ps

# Você deve ver:
# vendasmax-postgres    Up (healthy)
# vendasmax-redis       Up (healthy)
```

## ⚙️ Passo 3: Configurar Backend

```bash
cd backend

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Editar o arquivo .env (opcional - valores padrão já funcionam)
# nano .env  # ou use seu editor preferido

# Gerar tipos do Prisma
npm run db:generate

# Executar migrações do banco de dados
npm run db:migrate

# (Opcional) Popular banco com dados de exemplo
npm run db:seed
```

## 🏃 Passo 4: Iniciar Aplicações

### Opção A: Iniciar Tudo de Uma Vez (Recomendado)

Abra **3 terminais diferentes** e execute:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Aguarde ver: ✓ Servidor rodando na porta 3001
```

**Terminal 2 - Admin Web:**
```bash
cd admin-web
npm run dev

# Aguarde ver: Local: http://localhost:5173
```

**Terminal 3 - Client App:**
```bash
cd client-app
npm run dev

# Aguarde ver: Local: http://localhost:5174
```

### Opção B: Script Único (Se configurado)

```bash
# Na raiz do projeto
npm run dev:all
```

## 🌐 Passo 5: Acessar as Aplicações

Abra seu navegador e acesse:

- **Admin Web**: http://localhost:5173
- **Client App**: http://localhost:5174
- **API Backend**: http://localhost:3001/api/health

## 🧪 Testar a Aplicação

### Testar Admin Web

1. Acesse: http://localhost:5173
2. Faça login com credenciais de teste (se rodou o seed):
   - Usuário: `admin`
   - Senha: `admin123`

### Testar Client App

1. Acesse: http://localhost:5174
2. Faça login com credenciais de um condomínio (se rodou o seed):
   - Usuário: `condominio1`
   - Senha: `senha123`

## 🐛 Solução de Problemas

### ❌ Erro: "ERR_CONNECTION_REFUSED"

**Problema**: O backend não está rodando.

**Solução**:
```bash
cd backend
npm run dev
```

### ❌ Erro: "Database connection error"

**Problema**: PostgreSQL não está rodando ou credenciais incorretas.

**Solução**:
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Se não estiver, iniciar
docker-compose up -d postgres

# Aguardar ficar "healthy"
docker-compose ps
```

### ❌ Erro: "Port 3001 already in use"

**Problema**: Outra aplicação está usando a porta 3001.

**Solução**:
```bash
# Encontrar processo na porta 3001
lsof -i :3001

# Matar processo (substituir PID pelo número retornado)
kill -9 <PID>

# OU mudar a porta no backend/.env
PORT=3002
```

### ❌ Erro: "Prisma Client not generated"

**Problema**: O Prisma Client não foi gerado.

**Solução**:
```bash
cd backend
npm run db:generate
```

### ❌ Admin/Client não abre no navegador

**Problema**: Vite não iniciou corretamente.

**Solução**:
```bash
# Limpar cache e reinstalar
cd admin-web  # ou client-app
rm -rf node_modules .vite
npm install
npm run dev
```

## 🔍 Verificar Status dos Serviços

### Backend
```bash
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

### PostgreSQL
```bash
docker exec -it vendasmax-postgres psql -U vendasmax -d vendasmax -c "SELECT 1;"
# Deve retornar: 1
```

### Redis
```bash
docker exec -it vendasmax-redis redis-cli ping
# Deve retornar: PONG
```

## 📝 Variáveis de Ambiente Importantes

### Backend (.env)

Mínimo necessário para desenvolvimento:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://vendasmax:vendasmax123@localhost:5432/vendasmax
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret_key_change_in_production
```

Para testar pagamentos (opcional):
```env
# Stripe (modo teste)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Mercado Pago (modo teste)
MERCADOPAGO_ACCESS_TOKEN=TEST-...
MERCADOPAGO_PUBLIC_KEY=TEST-...
```

### Admin Web (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

### Client App (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## 📊 Estrutura de Portas

| Serviço       | Porta | URL                      |
|---------------|-------|--------------------------|
| Backend API   | 3001  | http://localhost:3001    |
| Admin Web     | 5173  | http://localhost:5173    |
| Client App    | 5174  | http://localhost:5174    |
| PostgreSQL    | 5432  | localhost:5432           |
| Redis         | 6379  | localhost:6379           |
| Prisma Studio | 5555  | http://localhost:5555    |

## 🎯 Próximos Passos

Agora que tudo está funcionando:

1. ✅ Explore o Admin Web para criar condomínios, containers e produtos
2. ✅ Teste o Client App fazendo login com um condomínio
3. ✅ Experimente o modo offline (desconecte a internet)
4. ✅ Teste pagamentos com chaves de teste do Stripe/Mercado Pago
5. ✅ Veja os logs no terminal do backend para debug

## 📚 Documentação Adicional

- [README Principal](./README.md) - Visão geral completa
- [Documentação da API](./docs/API.md) - Endpoints disponíveis
- [Guia de Desenvolvimento](./docs/DEVELOPMENT.md) - Padrões de código

## 💡 Dicas Úteis

### Visualizar Banco de Dados
```bash
cd backend
npm run db:studio
# Abre Prisma Studio em http://localhost:5555
```

### Ver Logs em Tempo Real
```bash
# Backend
cd backend
tail -f logs/app.log

# Docker
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Resetar Banco de Dados
```bash
cd backend
npm run db:migrate:reset
npm run db:seed
```

---

**Está com problemas?** Abra uma issue no GitHub ou entre em contato com a equipe!
