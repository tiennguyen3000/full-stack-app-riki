"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Button, Card, Field, Input, Alert } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Chào mừng bạn trở lại!</p>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
              required
            />
          </Field>
          <Field label="Mật khẩu">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-rose-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </Card>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        <p className="font-semibold text-slate-600">Tài khoản demo:</p>
        <ul className="mt-2 space-y-1">
          <li>👨‍🎓 Học viên: student1@riki.edu.vn</li>
          <li>👩‍🏫 Giáo viên: sensei@riki.edu.vn</li>
          <li>🛠️ Quản trị: admin@riki.edu.vn</li>
        </ul>
        <p className="mt-2 text-xs">Mật khẩu: password123</p>
      </div>
    </div>
  );
}
