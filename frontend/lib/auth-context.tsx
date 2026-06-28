"use client";

import React from "react";
import { API_URL } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: "admin" | "customer";
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Restore session from localStorage on mount
  React.useEffect(() => {
    try {
      const savedToken = localStorage.getItem("mintcare_token");
      const savedUser = localStorage.getItem("mintcare_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore parse errors
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

    localStorage.setItem("mintcare_token", data.token);
    localStorage.setItem("mintcare_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user as AuthUser;
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthUser> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, role: "customer" }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

    localStorage.setItem("mintcare_token", data.token);
    localStorage.setItem("mintcare_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user as AuthUser;
  };

  const logout = () => {
    localStorage.removeItem("mintcare_token");
    localStorage.removeItem("mintcare_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
