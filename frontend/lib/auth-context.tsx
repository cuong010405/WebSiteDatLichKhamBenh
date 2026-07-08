"use client";

import React from "react";
import { API_URL } from "@/lib/api";

const LOCAL_USERS_KEY = "mintcare_users";
const LOCAL_TOKEN_KEY = "mintcare_token";
const LOCAL_USER_KEY = "mintcare_user";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: "admin" | "customer";
  age?: number | null;
  gender?: string | null;
}

interface LocalStoredUser extends AuthUser {
  passwordHash: string; // simple btoa hash — not for production security, just avoids plain-text
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
}

const getDefaultLocalUsers = (): LocalStoredUser[] => [
  {
    id: "CU-0001",
    email: "evelyn.green@gmail.com",
    fullName: "Evelyn Green",
    phone: "090 987 6543",
    role: "customer",
    passwordHash: btoa("123456"), // base64-encoded, not plain-text
  },
];

const ensureLocalUsers = () => {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(LOCAL_USERS_KEY);
    if (!existing) {
      localStorage.setItem(
        LOCAL_USERS_KEY,
        JSON.stringify(getDefaultLocalUsers()),
      );
    }
  } catch {
    // ignore localStorage errors
  }
};

const loadLocalUsers = (): LocalStoredUser[] => {
  if (typeof window === "undefined") return getDefaultLocalUsers();
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (!stored) return getDefaultLocalUsers();
    return JSON.parse(stored) as LocalStoredUser[];
  } catch {
    return getDefaultLocalUsers();
  }
};

const saveLocalUsers = (users: LocalStoredUser[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const createLocalToken = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const loginLocal = (email: string, password: string) => {
  const users = loadLocalUsers();
  const found = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
  // Compare against base64-encoded hash
  if (!found || found.passwordHash !== btoa(password)) {
    throw new Error("Đăng nhập thất bại");
  }

  return {
    token: createLocalToken(),
    user: {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      phone: found.phone,
      role: found.role,
    },
  };
};

const registerLocal = (payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) => {
  const users = loadLocalUsers();
  if (
    users.some(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
    )
  ) {
    throw new Error("Đăng ký thất bại");
  }

  const newUser: LocalStoredUser = {
    id: `CU-${Date.now()}`,
    email: payload.email.toLowerCase(),
    fullName: payload.fullName,
    phone: payload.phone || null,
    role: "customer",
    passwordHash: btoa(payload.password), // base64-encoded, avoids plain-text storage
  };

  users.push(newUser);
  saveLocalUsers(users);

  return {
    token: createLocalToken(),
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
    },
  };
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Restore session from localStorage on mount
  React.useEffect(() => {
    ensureLocalUsers();
    try {
      const savedToken = localStorage.getItem(LOCAL_TOKEN_KEY);
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
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
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user as AuthUser;
    } catch (err: any) {
      console.warn("Backend auth failed, using local fallback:", err);
      const data = loginLocal(email, password);
      localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<AuthUser> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, role: "customer" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user as AuthUser;
    } catch (err: any) {
      console.warn("Backend register failed, using local fallback:", err);
      const data = registerLocal(payload);
      localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
  };

  const logout = () => {
    localStorage.removeItem("mintcare_token");
    localStorage.removeItem("mintcare_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
