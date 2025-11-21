# Guia de Implementação - Frontend

Este documento fornece um guia detalhado para implementar as aplicações frontend (admin-web e client-app) do sistema VendasMax.

## Visão Geral

O sistema VendasMax possui duas aplicações frontend:

1. **admin-web**: Painel administrativo para gestão completa do sistema
2. **client-app**: Aplicativo PWA para realização de vendas com modo offline

Ambas as aplicações seguem uma arquitetura similar baseada em:
- React 18 + TypeScript
- Vite como build tool
- TailwindCSS para estilos
- Zustand para gerenciamento de estado
- TanStack Query para gerenciamento de dados do servidor
- Axios para requisições HTTP

## Estrutura Recomendada de Arquivos

### Admin Web

```
admin-web/src/
├── components/
│   ├── ui/                          # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── Alert.tsx
│   ├── layout/                      # Componentes de layout
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   ├── forms/                       # Componentes de formulário
│   │   ├── CondominioForm.tsx
│   │   ├── ContainerForm.tsx
│   │   ├── ProdutoForm.tsx
│   │   └── EstoqueForm.tsx
│   └── tables/                      # Componentes de tabela
│       ├── CondominiosTable.tsx
│       ├── ProdutosTable.tsx
│       └── VendasTable.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── condominios/
│   │   ├── CondominiosList.tsx
│   │   ├── CondominioForm.tsx
│   │   └── CondominioDetail.tsx
│   ├── containers/
│   │   ├── ContainersList.tsx
│   │   ├── ContainerForm.tsx
│   │   └── ContainerEstoque.tsx
│   ├── produtos/
│   │   ├── ProdutosList.tsx
│   │   ├── ProdutoForm.tsx
│   │   └── CategoriasList.tsx
│   ├── estoque/
│   │   ├── EstoqueGeral.tsx
│   │   └── MovimentacaoEstoque.tsx
│   ├── vendas/
│   │   ├── VendasList.tsx
│   │   └── VendaDetail.tsx
│   └── relatorios/
│       ├── RelatorioVendas.tsx
│       ├── RelatorioEstoque.tsx
│       └── RelatorioFinanceiro.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── condominios.ts
│   ├── containers.ts
│   ├── produtos.ts
│   ├── vendas.ts
│   └── relatorios.ts
├── stores/
│   ├── authStore.ts
│   └── appStore.ts
├── hooks/
│   ├── useAuth.ts
│   └── useDebounce.ts
├── types/
│   └── index.ts
├── utils/
│   ├── format.ts
│   └── validation.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Client App

```
client-app/src/
├── components/
│   ├── ui/                          # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Loading.tsx
│   ├── cart/                        # Componentes do carrinho
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartButton.tsx
│   ├── products/                    # Componentes de produtos
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductSearch.tsx
│   ├── scanner/                     # Scanner de código
│   │   ├── BarcodeScanner.tsx
│   │   └── QRScanner.tsx
│   └── payment/                     # Componentes de pagamento
│       ├── PaymentMethod.tsx
│       ├── PixPayment.tsx
│       └── CardPayment.tsx
├── pages/
│   ├── Login.tsx
│   ├── ContainerSelect.tsx
│   ├── Products.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Payment.tsx
│   ├── Success.tsx
│   └── OfflineNotice.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── products.ts
│   ├── sales.ts
│   ├── payment.ts
│   └── offline.ts
├── offline/
│   ├── db.ts                        # IndexedDB (Dexie)
│   ├── sync.ts                      # Sincronização
│   └── queue.ts                     # Fila de operações
├── stores/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── offlineStore.ts
├── hooks/
│   ├── useOnline.ts
│   ├── useCart.ts
│   └── useScanner.ts
├── sw/
│   └── sw.ts                        # Service Worker
├── types/
│   └── index.ts
├── utils/
│   └── format.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Passo a Passo - Admin Web

### 1. Configuração Inicial

#### main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

#### index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### 2. Configurar Serviço de API

#### services/api.ts
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Criar Store de Autenticação

#### stores/authStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, senha) => {
        const response = await api.post('/auth/login/admin', { email, senha });
        const { token, usuario } = response.data;

        localStorage.setItem('token', token);
        set({ user: usuario, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 4. Implementar Páginas Principais

#### pages/Login.tsx
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          VendasMax Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 5. Criar Layout Principal

#### components/layout/AppLayout.tsx
```typescript
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 6. Implementar Rotas

#### App.tsx
```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Login from '@/pages/Login';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import CondominiosList from '@/pages/condominios/CondominiosList';
// ... outras páginas

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="condominios" element={<CondominiosList />} />
        {/* Adicionar outras rotas */}
      </Route>
    </Routes>
  );
}
```

## Passo a Passo - Client App

### 1. Configurar PWA

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'VendasMax Vendas',
        short_name: 'VendasMax',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60, // 1 hora
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 2. Configurar IndexedDB

#### offline/db.ts
```typescript
import Dexie, { Table } from 'dexie';

export interface OfflineVenda {
  id?: number;
  vendaId: string;
  containerId: string;
  itens: any[];
  valorTotal: number;
  clienteNome?: string;
  clienteBloco?: string;
  clienteApto?: string;
  clienteContato?: string;
  timestamp: number;
  sincronizada: boolean;
}

export class VendasMaxDB extends Dexie {
  vendas!: Table<OfflineVenda, number>;
  produtos!: Table<any, string>;

  constructor() {
    super('vendasmax');
    this.version(1).stores({
      vendas: '++id, vendaId, sincronizada, timestamp',
      produtos: 'id, nome, categoriaId',
    });
  }
}

export const db = new VendasMaxDB();
```

### 3. Implementar Detecção de Conexão

#### hooks/useOnline.ts
```typescript
import { useState, useEffect } from 'react';

export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 4. Implementar Carrinho de Compras

#### stores/cartStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  produtoId: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  foto?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.produtoId === item.produtoId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.produtoId === item.produtoId
                  ? { ...i, quantidade: i.quantidade + item.quantidade }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (produtoId) =>
        set((state) => ({
          items: state.items.filter((i) => i.produtoId !== produtoId),
        })),

      updateQuantity: (produtoId, quantidade) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.produtoId === produtoId ? { ...i, quantidade } : i
          ),
        })),

      clear: () => set({ items: [] }),

      total: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.valorUnitario * item.quantidade, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### 5. Implementar Scanner de Código

#### components/scanner/BarcodeScanner.tsx
```typescript
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'scanner',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current?.clear();
      },
      (error) => {
        onError?.(error);
      }
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, [onScan, onError]);

  return <div id="scanner" className="w-full max-w-md mx-auto" />;
}
```

### 6. Implementar Sincronização Offline

#### services/offline.ts
```typescript
import { db } from '@/offline/db';
import api from './api';

export async function syncPendingSales() {
  const pending = await db.vendas.where('sincronizada').equals(false).toArray();

  if (pending.length === 0) return;

  try {
    const response = await api.post('/vendas/sincronizar', { vendas: pending });
    const { vendasSincronizadas } = response.data;

    // Marcar como sincronizadas
    for (const venda of vendasSincronizadas) {
      if (venda.status === 'SINCRONIZADA') {
        await db.vendas
          .where('vendaId')
          .equals(venda.numeroVenda)
          .modify({ sincronizada: true });
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar vendas:', error);
    throw error;
  }
}

// Sincronizar automaticamente quando voltar online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingSales().catch(console.error);
  });
}
```

## Componentes UI Reutilizáveis

### Button Component

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}
```

## Próximos Passos

1. **Implementar todos os componentes UI base** (Button, Input, Modal, etc.)
2. **Criar todas as páginas CRUD** seguindo o padrão estabelecido
3. **Implementar relatórios com gráficos** usando Recharts
4. **Adicionar validação de formulários** com React Hook Form + Zod
5. **Implementar upload de imagens** para produtos
6. **Adicionar testes unitários** com Jest e React Testing Library
7. **Otimizar performance** com React.memo e useMemo
8. **Adicionar acessibilidade** (ARIA labels, keyboard navigation)
9. **Implementar internacionalização** (i18n) se necessário
10. **Configurar CI/CD** para deploy automático

## Recursos Úteis

- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
- [Dexie.js](https://dexie.org/)
- [Html5-QRCode](https://github.com/mebjas/html5-qrcode)
