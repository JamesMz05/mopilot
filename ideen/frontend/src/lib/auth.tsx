"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { apiFetch } from "./api";

interface User {
  id: number;
  email: string;
  name: string;
  role_id: number | null;
  role_name: string | null;
  user_type: "stakeholder" | "team" | "admin";
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    name: string;
    password: string;
    role_id?: number;
    user_type?: string;
  }) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ideen_token");
    if (saved) {
      setToken(saved);
      apiFetch<User>("/auth/me", { token: saved })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("ideen_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ access_token: string; user: User }>(
      "/auth/login",
      { method: "POST", body: { email, password } }
    );
    localStorage.setItem("ideen_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      name: string;
      password: string;
      role_id?: number;
      user_type?: string;
    }): Promise<string> => {
      const res = await apiFetch<{ message: string }>(
        "/auth/register",
        { method: "POST", body: data }
      );
      return res.message;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("ideen_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
