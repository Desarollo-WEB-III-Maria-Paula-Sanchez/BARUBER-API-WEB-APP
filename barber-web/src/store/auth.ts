import { create } from "zustand";

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  foto_url: string | null;
  telefono: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  hydrate: () => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    set({ 
      token: t, 
      user: u ? JSON.parse(u) : null,
      isHydrated: true 
    });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    set({ token });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));