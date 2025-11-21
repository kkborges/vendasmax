import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface Container {
  id: string;
  localizacao: string;
  bloco?: string;
}

interface Condominio {
  id: string;
  nome: string;
  containers: Container[];
}

interface AuthStore {
  condominio: Condominio | null;
  selectedContainer: Container | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  selectContainer: (container: Container) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      condominio: null,
      selectedContainer: null,
      token: null,
      isAuthenticated: false,

      login: async (usuario: string, senha: string) => {
        const response = await api.post('/auth/login/condominio', { usuario, senha });
        const { token, condominio } = response.data;

        localStorage.setItem('token', token);
        set({
          condominio,
          token,
          isAuthenticated: true,
        });
      },

      selectContainer: (container: Container) => {
        set({ selectedContainer: container });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          condominio: null,
          selectedContainer: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
