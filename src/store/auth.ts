'use client';
import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  totalBets: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('bolao_token', token);
    localStorage.setItem('bolao_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('bolao_token');
    localStorage.removeItem('bolao_user');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'admin',
  isLoggedIn: () => !!get().token,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('bolao_token');
    const userStr = localStorage.getItem('bolao_user');
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) });
      } catch {}
    }
  },
}));
