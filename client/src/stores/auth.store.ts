import { create } from 'zustand';
import { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitializing: (isInitializing: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isInitializing: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  logout: () => set({ user: null, isAuthenticated: false, isInitializing: false }),
}));
