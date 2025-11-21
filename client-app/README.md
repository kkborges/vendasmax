# VendasMax - Aplicativo de Vendas (PWA)

Aplicativo de vendas Progressive Web App (PWA) com modo offline para registro de vendas em containers de condomínios.

## Tecnologias

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- TanStack Query (React Query)
- Zustand (state management)
- Workbox (Service Worker / PWA)
- IndexedDB (Dexie.js para modo offline)
- Html5-QRCode (leitor de código de barras)
- Axios

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI base
│   ├── cart/           # Componentes do carrinho
│   ├── products/       # Componentes de produtos
│   └── scanner/        # Leitor de código de barras
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Login do condomínio
│   ├── ContainerSelect.tsx  # Seleção de container
│   ├── Products.tsx    # Listagem de produtos
│   ├── Cart.tsx        # Carrinho de compras
│   ├── Checkout.tsx    # Finalização da compra
│   └── Payment.tsx     # Processamento de pagamento
├── services/           # Serviços
│   ├── api.ts          # Cliente axios
│   ├── auth.ts         # Autenticação
│   ├── products.ts     # Produtos
│   ├── sales.ts        # Vendas
│   ├── payment.ts      # Pagamentos
│   └── offline.ts      # Sincronização offline
├── offline/            # Modo offline
│   ├── db.ts           # IndexedDB config (Dexie)
│   ├── sync.ts         # Sincronização
│   └── queue.ts        # Fila de operações
├── stores/             # Zustand stores
│   ├── authStore.ts    # Autenticação
│   ├── cartStore.ts    # Carrinho
│   └── offlineStore.ts # Estado offline
├── hooks/              # Custom hooks
│   ├── useOnline.ts    # Detecta conexão
│   ├── useCart.ts      # Gerenciar carrinho
│   └── useScanner.ts   # Scanner de código
├── sw/                 # Service Worker
│   └── sw.ts           # Service Worker config
├── types/              # TypeScript types
├── utils/              # Utilitários
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## Funcionalidades

### PWA (Progressive Web App)
- Instalável no dispositivo
- Funciona offline
- Service Worker para cache
- Cache de produtos e imagens
- Notificações push (futuro)

### Autenticação
- Login com usuário e senha do condomínio
- Seleção de container após login
- Token JWT
- Auto-logout em caso de erro

### Modo Offline
- Detecção automática de conexão
- Armazenamento local de vendas (IndexedDB)
- Sincronização automática ao voltar online
- Fila de operações pendentes
- Cache de produtos e imagens
- Indicador visual de status de conexão

### Carrinho de Compras
- Adicionar produtos
- Remover produtos
- Alterar quantidade
- Calcular total
- Aplicar descontos
- Persistência no localStorage

### Leitor de Código de Barras/QR Code
- Scanner via câmera
- Busca automática do produto
- Adição rápida ao carrinho
- Suporte a múltiplos formatos

### Catálogo de Produtos
- Listagem com fotos
- Busca por nome
- Filtro por categoria
- Indicador de estoque
- Produtos indisponíveis desabilitados

### Processamento de Pagamento
- PIX (QR Code)
- Cartão de crédito/débito
- Integração com maquininha
- Gateways: Stripe e Mercado Pago
- Até 3 tentativas automáticas
- Coleta de dados em caso de falha (opcional)

### Sistema de Pagamento Offline
- Registro da venda mesmo sem conexão
- Flag de "pagamento pendente"
- Coleta opcional de dados do cliente
  - Nome
  - Bloco/Apartamento
  - Telefone/WhatsApp
- Sincronização posterior
- Notificação ao admin

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
VITE_APP_NAME=VendasMax Vendas
VITE_ENABLE_PWA=true
```

## Rotas

- `/` - Redireciona para Products ou Login
- `/login` - Login do condomínio
- `/container-select` - Seleção de container
- `/products` - Catálogo de produtos
- `/cart` - Carrinho de compras
- `/checkout` - Finalização da compra
- `/payment` - Processamento de pagamento
- `/success` - Compra realizada
- `/offline` - Venda offline registrada

## Fluxo de Venda

### Online (conexão disponível)

```
1. Login do condomínio
   ↓
2. Selecionar container
   ↓
3. Navegar pelos produtos
   ↓
4. Adicionar ao carrinho (manual ou scanner)
   ↓
5. Revisar carrinho
   ↓
6. Finalizar compra
   ↓
7. Escolher método de pagamento
   ↓
8. Processar pagamento
   ↓
9a. Pagamento aprovado → Sucesso
9b. Pagamento recusado → Tentar novamente (até 3x)
9c. 3 falhas → Registrar como pendente
```

### Offline (sem conexão)

```
1. App detecta falta de conexão
   ↓
2. Exibe indicador "OFFLINE"
   ↓
3. Cliente seleciona produtos
   ↓
4. Finaliza compra
   ↓
5. Venda armazenada no IndexedDB
   ↓
6. Solicita dados do cliente (opcional)
   - Nome
   - Bloco/Apto
   - Contato
   ↓
7. Venda marcada como "pendente de sincronização"
   ↓
8. Quando voltar online:
   - App detecta conexão
   - Sincroniza vendas pendentes
   - Processa pagamentos
   - Atualiza status
```

## IndexedDB Schema

```typescript
interface OfflineVenda {
  id: string;
  containerId: string;
  itens: VendaItem[];
  valorTotal: number;
  clienteNome?: string;
  clienteBloco?: string;
  clienteApto?: string;
  clienteContato?: string;
  timestamp: number;
  sincronizada: boolean;
}

interface CachedProduct {
  id: string;
  nome: string;
  valorVenda: number;
  foto?: string;
  estoque: number;
  lastUpdate: number;
}
```

## Service Worker

O Service Worker cacheia:
- Assets estáticos (JS, CSS, imagens)
- Produtos e suas imagens
- Fonte da aplicação
- API responses (limitado)

### Estratégias de Cache

- **Cache First**: Assets estáticos, imagens de produtos
- **Network First**: Dados de produtos, estoque
- **Network Only**: Vendas, pagamentos

## Estado Offline (Zustand)

```typescript
interface OfflineStore {
  isOnline: boolean;
  pendingSales: OfflineVenda[];
  isSyncing: boolean;
  syncErrors: string[];
  addPendingSale: (sale: OfflineVenda) => void;
  sync: () => Promise<void>;
  clearSynced: () => void;
}
```

## Leitor de Código de Barras

### Uso do Scanner

```typescript
import { useScanner } from '@/hooks/useScanner';

const { startScanner, stopScanner, result, error } = useScanner({
  onScan: (code) => {
    // Buscar produto e adicionar ao carrinho
    const produto = await buscarPorCodigo(code);
    adicionarAoCarrinho(produto);
  }
});

// No componente
<button onClick={startScanner}>Escanear</button>
<video ref={videoRef} />
```

### Formatos Suportados

- EAN-13 (código de barras padrão)
- QR Code
- CODE-128
- UPC-A

## Processamento de Pagamento

### PIX

```typescript
// 1. Criar venda
const venda = await criarVenda(itens);

// 2. Processar pagamento PIX
const pagamento = await processarPagamento({
  vendaId: venda.id,
  metodoPagamento: 'PIX',
  gateway: 'MERCADOPAGO',
  valorPago: venda.valorTotal
});

// 3. Exibir QR Code
if (pagamento.pixQrCode) {
  exibirQRCode(pagamento.pixQrCode);

  // 4. Verificar status periodicamente
  const interval = setInterval(async () => {
    const status = await verificarPagamento(pagamento.id);
    if (status === 'APROVADO') {
      clearInterval(interval);
      navegarParaSucesso();
    }
  }, 3000);
}
```

### Cartão (Stripe)

```typescript
// 1. Coletar dados do cartão (Stripe Elements)
const cardElement = elements.getElement('card');

// 2. Criar token
const { token } = await stripe.createToken(cardElement);

// 3. Processar pagamento
const resultado = await processarPagamento({
  vendaId: venda.id,
  metodoPagamento: 'CREDITO',
  gateway: 'STRIPE',
  valorPago: venda.valorTotal,
  cardToken: token.id
});

// 4. Verificar resultado
if (resultado.sucesso) {
  navegarParaSucesso();
} else {
  // Tentar novamente (até 3x)
  tentarNovamente();
}
```

### Maquininha

```typescript
// Integração específica de cada fornecedor
// Ex: Stone, PagSeguro, Cielo, etc.

const resultado = await processarPagamento({
  vendaId: venda.id,
  metodoPagamento: 'CREDITO',
  gateway: 'MAQUININHA',
  valorPago: venda.valorTotal,
  maquininhaId: 'MAQ001'
});
```

## Sincronização Offline

### Auto-sincronização

```typescript
// Detectar quando volta online
window.addEventListener('online', async () => {
  await syncPendingSales();
});

// Sincronizar vendas pendentes
const syncPendingSales = async () => {
  const pending = await db.vendas.where('sincronizada').equals(false).toArray();

  for (const venda of pending) {
    try {
      await api.post('/vendas/sincronizar', { vendas: [venda] });
      await db.vendas.update(venda.id, { sincronizada: true });
    } catch (error) {
      // Registrar erro e tentar depois
      console.error('Erro ao sincronizar:', error);
    }
  }
};
```

## Build e Deploy

```bash
# Build
npm run build

# Testar PWA localmente
npm run preview

# Deploy
# Os arquivos estarão em dist/
# Deploy para servidor web com HTTPS (obrigatório para PWA)
```

## Instalação do PWA

### Android
1. Abrir no Chrome
2. Menu → "Adicionar à tela inicial"
3. App instalado como aplicativo nativo

### iOS
1. Abrir no Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. App instalado

## Desenvolvimento

### Testar modo offline

```javascript
// No DevTools
// Application → Service Workers → Offline

// Ou via código
navigator.serviceWorker.ready.then(registration => {
  // Simular offline
  window.dispatchEvent(new Event('offline'));
});
```

### Limpar cache

```javascript
// No DevTools
// Application → Clear storage → Clear site data

// Ou via código
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Melhorias Futuras

- [ ] Notificações push
- [ ] Biometria para autenticação
- [ ] Histórico de compras do cliente
- [ ] Programa de fidelidade
- [ ] Cupons de desconto
- [ ] Compartilhamento de carrinho
- [ ] Lista de favoritos
- [ ] Sugestões personalizadas
- [ ] Modo escuro
- [ ] Múltiplos idiomas

## Troubleshooting

### PWA não instala
- Verificar HTTPS
- Verificar manifest.json
- Verificar Service Worker registrado

### Scanner não funciona
- Verificar permissão de câmera
- Verificar HTTPS (obrigatório)
- Testar em dispositivo real (não emulador)

### Sincronização offline não funciona
- Verificar IndexedDB disponível
- Verificar evento 'online' sendo disparado
- Verificar logs do console
