import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  authChecked: false,
  
  setAuth: (user) => {
    set({ user, isAuthenticated: true, authChecked: true });
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false, authChecked: true });
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (_) {
      console.error('Logout failed', _);
    } finally {
      set({ user: null, isAuthenticated: false, authChecked: true });
    }
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get('/me');
      set({ user: data, isAuthenticated: true, authChecked: true });
    } catch {
      set({ user: null, isAuthenticated: false, authChecked: true });
    }
  },
}));
