"use client";

import { useFetch, formatDate, type Paginated } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Card, Badge, LoadingBlock, ErrorState } from "@/components/ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  level: string | null;
  coins: number;
  createdAt: string;
  enrollmentCount: number;
};

const roleColor: Record<string, "rose" | "blue" | "slate"> = {
  admin: "rose",
  teacher: "blue",
  student: "slate",
};

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<Paginated<UserRow>>(
    user?.role === "admin" ? "/api/admin/users?pageSize=50" : null
  );

  if (authLoading) return <LoadingBlock />;
  if (!user || user.role !== "admin")
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">Không có quyền truy cập.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Người dùng</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trình độ</th>
              <th className="px-4 py-3">Coin</th>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Đăng ký lúc</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7}><LoadingBlock /></td></tr>}
            {error && <tr><td colSpan={7}><ErrorState message={error} onRetry={reload} /></td></tr>}
            {!loading && !error && data?.data.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3"><Badge color={roleColor[u.role] ?? "slate"}>{u.role}</Badge></td>
                <td className="px-4 py-3 text-slate-500">{u.level ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-amber-600">🪙 {u.coins}</td>
                <td className="px-4 py-3 text-slate-500">{u.enrollmentCount}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
