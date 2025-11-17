# API Reference - VendasMax

Base URL: `http://localhost:3001/api`

## Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer <token>
```

### POST /auth/login/admin
Login de administrador

**Request:**
```json
{
  "email": "admin@vendasmax.com.br",
  "senha": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "email": "admin@vendasmax.com.br",
    "nome": "Administrador",
    "role": "ADMIN"
  }
}
```

### POST /auth/login/condominio
Login de condomínio (para app de vendas)

**Request:**
```json
{
  "usuario": "condominio_exemplo",
  "senha": "condo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "condominio": {
    "id": "uuid",
    "nome": "Condomínio Exemplo",
    "containers": [
      {
        "id": "uuid",
        "localizacao": "Bloco A - Térreo",
        "bloco": "A"
      }
    ]
  }
}
```

## Condomínios

### GET /condominios
Listar condomínios (paginado)

**Query Params:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome ou CNPJ

**Response:**
```json
{
  "condominios": [
    {
      "id": "uuid",
      "cnpj": "12.345.678/0001-90",
      "nome": "Condomínio Exemplo",
      "rua": "Rua das Flores, 123",
      "cep": "01234-567",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "totalBlocos": 3,
      "totalApartamentos": 60,
      "ativo": true,
      "contratoRescindido": false,
      "containers": []
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### POST /condominios
Criar condomínio

**Request:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "nome": "Condomínio Novo",
  "rua": "Rua Exemplo, 456",
  "cep": "12345-678",
  "bairro": "Bairro",
  "cidade": "Cidade",
  "estado": "SP",
  "totalBlocos": 2,
  "totalApartamentos": 40,
  "usuario": "condominio_novo",
  "senha": "senha123",
  "containers": [
    {
      "localizacao": "Bloco A - Térreo",
      "bloco": "A",
      "espaco": "Térreo"
    }
  ]
}
```

### GET /condominios/:id
Buscar condomínio por ID

### PUT /condominios/:id
Atualizar condomínio

### DELETE /condominios/:id
Deletar condomínio

### PATCH /condominios/:id/rescindir
Rescindir contrato do condomínio

## Containers

### GET /containers
Listar containers

**Query Params:**
- `condominioId`: Filtrar por condomínio

### GET /containers/:id
Buscar container por ID

### POST /containers
Criar container

**Request:**
```json
{
  "condominioId": "uuid",
  "localizacao": "Bloco B - 1º Andar",
  "bloco": "B",
  "espaco": "1º Andar"
}
```

### GET /containers/:id/estoque
Buscar estoque do container

**Response:**
```json
{
  "estoque": [
    {
      "id": "uuid",
      "containerId": "uuid",
      "produtoId": "uuid",
      "quantidade": 50,
      "dataValidade": "2024-12-31T00:00:00.000Z",
      "lote": "L001",
      "produto": {
        "id": "uuid",
        "nome": "Água Mineral 500ml",
        "valorVenda": "2.50",
        "estoqueMinimo": 30,
        "categoria": {
          "nome": "Bebidas"
        }
      }
    }
  ]
}
```

### PUT /containers/:id/estoque
Atualizar estoque do container

**Request:**
```json
{
  "produtoId": "uuid",
  "quantidade": 100,
  "dataValidade": "2024-12-31",
  "lote": "L002"
}
```

## Produtos

### GET /produtos
Listar produtos

**Query Params:**
- `page`: Número da página
- `limit`: Itens por página
- `search`: Busca por nome/descrição
- `categoriaId`: Filtrar por categoria

### GET /produtos/:id
Buscar produto por ID

### GET /produtos/codigo/:codigo
Buscar produto por código de barras ou QR code

### POST /produtos
Criar produto

**Request:**
```json
{
  "categoriaId": "uuid",
  "nome": "Produto Novo",
  "descricao": "Descrição do produto",
  "codigoBarras": "7891234567890",
  "qrCode": "QR123456",
  "foto": "https://...",
  "estoqueMinimo": 20,
  "valorCompra": "5.00",
  "valorVenda": "8.50",
  "unidade": "UN",
  "estoqueInicial": 100
}
```

### PUT /produtos/:id
Atualizar produto

### DELETE /produtos/:id
Deletar (desativar) produto

## Categorias

### GET /produtos/categorias/listar
Listar categorias

### POST /produtos/categorias
Criar categoria

**Request:**
```json
{
  "nome": "Nova Categoria",
  "descricao": "Descrição da categoria"
}
```

## Vendas

### GET /vendas
Listar vendas

**Query Params:**
- `page`: Número da página
- `limit`: Itens por página
- `containerId`: Filtrar por container
- `status`: Filtrar por status (PENDENTE, PAGO, CANCELADO)
- `dataInicio`: Data inicial (YYYY-MM-DD)
- `dataFim`: Data final (YYYY-MM-DD)

### GET /vendas/:id
Buscar venda por ID

### POST /vendas
Criar venda

**Request:**
```json
{
  "containerId": "uuid",
  "itens": [
    {
      "produtoId": "uuid",
      "quantidade": 2,
      "desconto": 0
    }
  ],
  "clienteNome": "João Silva",
  "clienteBloco": "A",
  "clienteApto": "101",
  "clienteContato": "+5511999999999",
  "modoOffline": false,
  "observacao": "Observação"
}
```

### POST /vendas/sincronizar
Sincronizar vendas offline

**Request:**
```json
{
  "vendas": [
    {
      "numeroVenda": "V1234567890",
      "containerId": "uuid",
      "itens": [...],
      "clienteNome": "...",
      "modoOffline": true
    }
  ]
}
```

**Response:**
```json
{
  "mensagem": "Sincronização concluída",
  "vendasSincronizadas": [
    {
      "numeroVenda": "V1234567890",
      "status": "SINCRONIZADA"
    }
  ],
  "erros": []
}
```

### PATCH /vendas/:id/status
Atualizar status da venda

**Request:**
```json
{
  "status": "PAGO",
  "observacao": "Pagamento confirmado manualmente"
}
```

### POST /vendas/:id/cancelar
Cancelar venda

**Request:**
```json
{
  "motivo": "Cliente desistiu da compra"
}
```

## Pagamentos

### POST /pagamentos
Processar pagamento

**Request:**
```json
{
  "vendaId": "uuid",
  "metodoPagamento": "PIX",
  "gateway": "MERCADOPAGO",
  "valorPago": 15.50
}
```

**Response:**
```json
{
  "sucesso": true,
  "pagamento": {
    "id": "uuid",
    "status": "APROVADO",
    "transactionId": "MP123456"
  },
  "resultado": {
    "status": "APROVADO",
    "transactionId": "MP123456",
    "mensagem": "Pagamento aprovado"
  }
}
```

### GET /pagamentos/:id/verificar
Verificar status do pagamento (especialmente PIX)

**Response:**
```json
{
  "status": "APROVADO"
}
```

## Relatórios

### GET /relatorios/dashboard
Dashboard geral

**Response:**
```json
{
  "resumo": {
    "totalCondominios": 5,
    "totalContainers": 12,
    "totalProdutos": 150,
    "totalVendas": 245,
    "vendasPendentes": 3,
    "vendasHoje": 18,
    "valorTotalUltimos30Dias": 5420.50
  }
}
```

### GET /relatorios/vendas
Relatório de vendas

**Query Params:**
- `dataInicio`: Data inicial (obrigatório)
- `dataFim`: Data final (obrigatório)
- `containerId`: Filtrar por container (opcional)
- `periodo`: mensal, semanal, quinzenal (opcional)

**Response:**
```json
{
  "periodo": {
    "inicio": "2024-01-01",
    "fim": "2024-01-31"
  },
  "resumo": {
    "totalVendas": 150,
    "valorTotal": 4532.80,
    "ticketMedio": 30.22,
    "vendasPorStatus": {
      "PAGO": 145,
      "PENDENTE": 5
    }
  },
  "topProdutos": [...],
  "vendasPorCategoria": {...}
}
```

### GET /relatorios/estoque
Relatório de estoque

**Query Params:**
- `containerId`: Filtrar por container (opcional)

**Response:**
```json
{
  "resumo": {
    "totalProdutos": 150,
    "valorTotalEstoque": 25340.50,
    "produtosEstoqueBaixo": 8,
    "produtosVencendo": 3
  },
  "estoqueBaixo": [...],
  "produtosVencendo": [...],
  "estoquePorCategoria": {...}
}
```

### GET /relatorios/financeiro
Relatório financeiro

**Query Params:**
- `dataInicio`: Data inicial (obrigatório)
- `dataFim`: Data final (obrigatório)

**Response:**
```json
{
  "periodo": {
    "inicio": "2024-01-01",
    "fim": "2024-01-31"
  },
  "resumo": {
    "receitaTotal": 12450.80,
    "custoTotal": 7850.30,
    "lucroTotal": 4600.50,
    "margemLucro": "36.94%",
    "totalVendas": 320
  },
  "pagamentosPorMetodo": {
    "PIX": {
      "quantidade": 180,
      "valorTotal": 6250.40
    },
    "CREDITO": {
      "quantidade": 140,
      "valorTotal": 6200.40
    }
  }
}
```

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos na requisição
- `401 Unauthorized`: Token não fornecido ou inválido
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Rate Limiting

- Máximo de 100 requisições por 15 minutos por IP
- Header `X-RateLimit-Remaining` indica requisições restantes
- Header `X-RateLimit-Reset` indica quando o limite reseta

## Webhooks

### POST /pagamentos/webhook/stripe
Recebe notificações do Stripe sobre pagamentos

### POST /pagamentos/webhook/mercadopago
Recebe notificações do Mercado Pago sobre pagamentos
