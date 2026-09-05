"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/client";

type User = { id: string; name: string; email: string; role: string; level?: string | null; coins?: number };
type Ctx = { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try { const j: any = await api("/api/auth/me"); setUser(j.user); } catch { setUser(null); } finally { setLoading(false); }
  };
  const logout = async () => { try { await api("/api/auth/logout", { method: "POST" }); } catch {} setUser(null); };
  useEffect(() => { refresh(); }, []);
  return <AuthCtx.Provider value={{ user, loading, refresh, logout }}>{children}</AuthCtx.Provider>;
}
export function useAuth() { return useContext(AuthCtx); }
