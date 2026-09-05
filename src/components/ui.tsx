"use client";
import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: "rose" | "blue" | "green" | "amber" | "slate" }) {
  const map: Record<string,string> = {
    rose: "bg-rose-100 text-rose-700", blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}>{children}</span>;
}
export function Button({ children, variant="primary", size="md", className="", ...props }: any) {
  const v: Record<string,string> = {
    primary: "bg-rose-600 text-white hover:bg-rose-700",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
  };
  const s: Record<string,string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return <button className={`rounded-lg font-semibold disabled:opacity-50 ${v[variant]||v.primary} ${s[size]||s.md} ${className}`} {...props}>{children}</button>;
}
export function Input(props: any) { return <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" {...props} />; }
export function Textarea(props: any) { return <textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" {...props} />; }
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
}
export function Alert({ children, tone="error" }: { children: React.ReactNode; tone?: "error" | "success" | "info" }) {
  const m: Record<string,string> = { error: "bg-rose-50 text-rose-700 border-rose-200", success: "bg-emerald-50 text-emerald-700 border-emerald-200", info: "bg-blue-50 text-blue-700 border-blue-200" };
  return <div className={`rounded-lg border px-3 py-2 text-sm ${m[tone]}`}>{children}</div>;
}
export function LoadingBlock({ text="Đang tải..." }: { text?: string }) { return <div className="py-10 text-center text-slate-400">{text}</div>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="py-6 text-center"><p className="text-rose-600">{message}</p>{onRetry && <button onClick={onRetry} className="mt-2 text-sm font-semibold text-rose-600 underline">Thử lại</button>}</div>;
}
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center"><p className="font-semibold text-slate-700">{title}</p>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}
export function SkeletonCard() { return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />; }
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p:number)=>void }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-center gap-2">{Array.from({ length: totalPages }).slice(0,7).map((_,i) => { const p=i+1; return <button key={p} onClick={()=>onChange(p)} className={`h-8 min-w-8 rounded-lg px-2 text-sm ${p===page ? "bg-rose-600 text-white" : "bg-white border border-slate-200"}`}>{p}</button>;})}</div>;
}
export function LinkButton({ href, children, variant="primary", size="md" }: { href:string; children: React.ReactNode; variant?: string; size?: string }) {
  const v: Record<string,string> = { primary: "bg-rose-600 text-white", secondary: "bg-white border border-slate-200 text-slate-700" };
  const s: Record<string,string> = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" };
  return <a href={href} className={`inline-flex rounded-lg font-semibold ${v[variant as string]||v.primary} ${s[size as string]||s.md}`}>{children}</a>;
}
