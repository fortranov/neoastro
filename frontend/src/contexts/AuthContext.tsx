"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, isAdmin: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/callback", "/auth/verify-email"];
const ADMIN_PATHS = ["/admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      return res.data;
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const init = async () => {
      const userData = await fetchUser();
      setLoading(false);

      const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname?.startsWith("/auth/")
      );
      const isAdmin = ADMIN_PATHS.some((p) => pathname?.startsWith(p));
      const isDashboard = pathname?.startsWith("/dashboard");

      if (!userData && !isPublic) {
        router.replace("/auth/login");
      } else if (userData && (pathname === "/auth/login" || pathname === "/auth/register")) {
        router.replace("/dashboard");
      } else if (userData && isAdmin && !userData.is_admin) {
        router.replace("/dashboard");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const login = async (token: string, isAdmin: boolean) => {
    localStorage.setItem("access_token", token);
    const res = await authApi.getMe();
    setUser(res.data);
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
