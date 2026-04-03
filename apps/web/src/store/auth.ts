import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  setToken: (token) => {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ token: null });
  },
}));
