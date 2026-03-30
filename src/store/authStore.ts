import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  handleGoogleCredential: (credential: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  setAuth: (user, token) => {
    localStorage.setItem("deverse_token", token);
    localStorage.setItem("deverse_user", JSON.stringify(user));
    set({ user, token });
  },

  logout: async () => {
    const { token } = get();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    localStorage.removeItem("deverse_token");
    localStorage.removeItem("deverse_user");
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    const storedToken = localStorage.getItem("deverse_token");
    if (!storedToken) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (res.ok) {
        const user = (await res.json()) as AuthUser;
        set({ user, token: storedToken, isLoading: false, isInitialized: true });
        localStorage.setItem("deverse_user", JSON.stringify(user));
      } else {
        // Token expired or invalid
        localStorage.removeItem("deverse_token");
        localStorage.removeItem("deverse_user");
        set({ user: null, token: null, isLoading: false, isInitialized: true });
      }
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  handleGoogleCredential: async (credential: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error: string };
        throw new Error(err.error || "Authentication failed");
      }

      const { token, user } = (await res.json()) as { token: string; user: AuthUser };
      localStorage.setItem("deverse_token", token);
      localStorage.setItem("deverse_user", JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
