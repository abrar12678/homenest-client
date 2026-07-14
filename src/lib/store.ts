import { create } from 'zustand';
import type { IUser } from '@/types';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user: IUser, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('homenest_user', JSON.stringify(user));
      localStorage.setItem('homenest_token', token);
    }
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('homenest_user');
      localStorage.removeItem('homenest_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  initialize: () => {
    if (typeof window === 'undefined') return;
    try {
      const storedUser = localStorage.getItem('homenest_user');
      const storedToken = localStorage.getItem('homenest_token');
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser) as IUser;
        set({ user, token: storedToken, isAuthenticated: true });
      }
    } catch {
      // Invalid stored data — clear it
      localStorage.removeItem('homenest_user');
      localStorage.removeItem('homenest_token');
    }
  },
}));