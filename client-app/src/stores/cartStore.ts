import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
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
  itemCount: () => number;
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

      itemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantidade, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
