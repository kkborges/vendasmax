# Guia de Instalação - VendasMax

Este guia fornece instruções detalhadas para instalar e configurar o sistema VendasMax.

## Requisitos do Sistema

### Software Necessário
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 6
- Docker e Docker Compose (opcional, mas recomendado)

### Contas de Serviços Externos
- Stripe (para pagamentos com cartão)
- Mercado Pago (para PIX e cartão)
- SendGrid (para envio de emails)
- Twilio (para SMS e WhatsApp)
- AWS S3 ou similar (para armazenamento de imagens)

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/vendasmax.git
cd vendasmax
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instalará as dependências de todos os workspaces (backend, admin-web, client-app, shared).

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis:

#### Banco de Dados
```env
DATABASE_URL=postgresql://vendasmax:vendasmax123@localhost:5432/vendasmax
REDIS_URL=redis://localhost:6379
```

#### JWT
```env
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
JWT_EXPIRES_IN=7d
```

#### Stripe
```env
STRIPE_SECRET_KEY=sk_test_seu_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_seu_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
```

#### Mercado Pago
```env
MERCADOPAGO_ACCESS_TOKEN=seu_mercado_pago_access_token
MERCADOPAGO_PUBLIC_KEY=seu_mercado_pago_public_key
```

#### SendGrid (Email)
```env
SENDGRID_API_KEY=seu_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@vendasmax.com.br
SENDGRID_FROM_NAME=VendasMax
```

#### Twilio (SMS/WhatsApp)
```env
TWILIO_ACCOUNT_SID=seu_twilio_account_sid
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_PHONE_NUMBER=+5511999999999
TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999
```

#### AWS S3
```env
AWS_ACCESS_KEY_ID=seu_aws_access_key
AWS_SECRET_ACCESS_KEY=seu_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=vendasmax-products
```

### 4. Iniciar Banco de Dados com Docker

```bash
npm run docker:up
```

Isso iniciará containers Docker para PostgreSQL e Redis.

Ou, se preferir instalar manualmente:

#### PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql-14

# macOS
brew install postgresql@14
```

#### Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
```

### 5. Executar Migrações do Banco de Dados

```bash
npm run db:migrate
```

### 6. Popular Banco com Dados de Exemplo

```bash
npm run db:seed
```

Isso criará:
- Usuário admin: `admin@vendasmax.com.br` / `admin123`
- Condomínio exemplo: `condominio_exemplo` / `condo123`
- Categorias de produtos
- Produtos de exemplo
- Containers e estoque

## Executar a Aplicação

### Desenvolvimento

#### Iniciar todos os serviços
```bash
npm run dev
```

Isso iniciará:
- Backend API: http://localhost:3001
- Admin Web: http://localhost:3000
- Client App: http://localhost:3002

#### Iniciar serviços individualmente
```bash
# Backend apenas
npm run dev:backend

# Admin web apenas
npm run dev:admin

# Client app apenas
npm run dev:client
```

### Produção

```bash
# Build de todos os projetos
npm run build

# Iniciar backend em produção
npm run start --workspace=backend
```

## Acessar a Aplicação

### Painel Administrativo
- URL: http://localhost:3000
- Email: admin@vendasmax.com.br
- Senha: admin123

### Aplicativo de Vendas
- URL: http://localhost:3002
- Usuário: condominio_exemplo
- Senha: condo123

### API Backend
- URL: http://localhost:3001/api
- Documentação: http://localhost:3001/api/health

## Comandos Úteis

```bash
# Ver logs do Docker
npm run docker:logs

# Parar containers Docker
npm run docker:down

# Abrir Prisma Studio (interface visual do banco)
npm run db:studio

# Executar testes
npm test

# Linting
npm run lint

# Formatar código
npm run format
```

## Configuração de Produção

### 1. Variáveis de Ambiente

Certifique-se de configurar as variáveis de ambiente para produção:

```env
NODE_ENV=production
API_URL=https://api.vendasmax.com.br
```

### 2. SSL/HTTPS

Configure um reverse proxy (Nginx ou Caddy) com certificado SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name api.vendasmax.com.br;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Deploy com Docker

```bash
# Build das imagens
docker-compose build

# Iniciar em produção
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Troubleshooting

### Erro de Conexão com Banco de Dados

Verifique se o PostgreSQL está rodando:
```bash
docker ps
# ou
sudo systemctl status postgresql
```

Teste a conexão:
```bash
psql -h localhost -U vendasmax -d vendasmax
```

### Erro de Migração

Resete o banco de dados (CUIDADO: apaga todos os dados):
```bash
npm run db:push --workspace=backend
```

### Porta já em uso

Se alguma porta já estiver em uso, altere no arquivo `.env`:
```env
PORT=3005  # Backend
VITE_PORT=3010  # Admin
VITE_CLIENT_PORT=3020  # Client
```

### Problemas com Redis

Verifique se o Redis está rodando:
```bash
redis-cli ping
# Deve retornar: PONG
```

## Próximos Passos

1. Configurar webhook do Stripe
2. Configurar webhook do Mercado Pago
3. Testar envio de notificações
4. Configurar backup automático do banco
5. Monitorar logs e performance

## Suporte

Para problemas ou dúvidas:
- Email: suporte@vendasmax.com.br
- Documentação: https://docs.vendasmax.com.br
- Issues: https://github.com/seu-usuario/vendasmax/issues
