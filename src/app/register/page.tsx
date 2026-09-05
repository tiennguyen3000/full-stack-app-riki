"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Button, Card, Field, Input, Alert } from "@/components/ui";

const levels = ["N5", "N4", "N3", "N2", "N1", "Kaiwa", "Business"];

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", level: "N5" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && typeof err.details === "object" && err.details) {
        setFieldErrors(err.details as Record<string, string[]>);
        setError("Vui lòng kiểm tra lại thông tin");
      } else {
        setError(err instanceof ApiError ? err.message : "Đã xảy ra lỗi");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Bắt đầu hành trình chinh phục JLPT</p>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Họ và tên" error={fieldErrors.name?.[0]}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nguyễn Văn A" required />
          </Field>
          <Field label="Email" error={fieldErrors.email?.[0]}>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="ban@example.com" required />
          </Field>
          <Field label="Mật khẩu" error={fieldErrors.password?.[0]}>
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Tối thiểu 6 ký tự" required />
          </Field>
          <Field label="Trình độ mục tiêu">
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-rose-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </Card>
    </div>
  );
}
