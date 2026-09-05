"use client";
import { useEffect, useState, useCallback } from "react";

export type Paginated<T> = { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { error: text }; }
  if (!res.ok) {
    throw new ApiError(json?.error || res.statusText || "Request failed", res.status, json?.details);
  }
  return json as T;
}

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const j = await api<T>(url);
      setData(j);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) { setLoading(false); return; }
    reload();
  }, [url, reload]);

  return { data, loading, error, reload };
}

export function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}
export function formatDate(s: string) {
  try { return new Date(s).toLocaleDateString("vi-VN"); } catch { return s; }
}
