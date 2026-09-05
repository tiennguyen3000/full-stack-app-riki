"use client";

import { useState } from "react";
import { useFetch, api, formatVND, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  Button,
  Input,
  Field,
  Textarea,
  Alert,
  LoadingBlock,
  ErrorState,
} from "@/components/ui";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  level: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  category: string | null;
  enrollmentCount: number;
};

type Category = { id: string; name: string; slug: string };

export default function AdminCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<{ data: CourseRow[] }>(
    user?.role === "admin" ? "/api/admin/courses" : null
  );
  const cats = useFetch<{ data: Category[] }>("/api/categories");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    level: "N5",
    price: 1000000,
    duration: "3 tháng",
    sessions: 48,
  });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (authLoading) return <LoadingBlock />;
  if (!user || user.role !== "admin")
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">Không có quyền truy cập.</div>;

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      await api("/api/admin/courses", { method: "POST", body: JSON.stringify(form) });
      setMessage({ ok: true, text: "Đã tạo khóa học" });
      setForm({ ...form, title: "", slug: "", description: "" });
      reload();
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Đã xảy ra lỗi" });
    } finally {
      setCreating(false);
    }
  }

  async function toggle(id: string, field: "isActive" | "isFeatured", value: boolean) {
    await api(`/api/admin/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: value }),
    });
    reload();
  }

  async function remove(id: string) {
    if (!confirm("Xóa khóa học này?")) return;
    await api(`/api/admin/courses/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Quản lý khóa học</h1>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-700">Thêm khóa học</h2>
        <form onSubmit={createCourse} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Tên khóa học">
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="khoa-hoc-moi" required />
          </Field>
          <div className="md:col-span-2">
            <Field label="Mô tả">
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} required />
            </Field>
          </div>
          <Field label="Danh mục">
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
              <option value="">Chọn danh mục</option>
              {cats.data?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Trình độ">
            <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {["N5", "N4", "N3", "N2", "N1", "Kaiwa", "Business", "Tokutei"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Giá (VND)">
            <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thời lượng">
              <Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} required />
            </Field>
            <Field label="Số buổi">
              <Input type="number" value={form.sessions} onChange={(e) => setForm((f) => ({ ...f, sessions: Number(e.target.value) }))} required />
            </Field>
          </div>
          <div className="md:col-span-2">
            {message && <Alert tone={message.ok ? "success" : "error"}>{message.text}</Alert>}
            <Button type="submit" disabled={creating} className="mt-3">
              {creating ? "Đang tạo..." : "Tạo khóa học"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-8 space-y-3">
        {loading && <LoadingBlock />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data?.data.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{c.title}</span>
                  {c.isFeatured && <Badge color="amber">Nổi bật</Badge>}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {c.level} · {c.category} · {c.enrollmentCount} học viên · {formatVND(c.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={c.isActive ? "secondary" : "primary"}
                  onClick={() => toggle(c.id, "isActive", !c.isActive)}
                >
                  {c.isActive ? "Đang mở" : "Đã ẩn"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggle(c.id, "isFeatured", !c.isFeatured)}>
                  {c.isFeatured ? "Bỏ nổi bật" : "Đặt nổi bật"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => remove(c.id)}>
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
