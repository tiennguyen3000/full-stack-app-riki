"use client";

import Link from "next/link";
import { useFetch, formatVND } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Card, LoadingBlock, ErrorState } from "@/components/ui";

type Stats = { users: number; courses: number; enrollments: number; posts: number; revenue: number };

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<{ stats: Stats }>(
    user?.role === "admin" ? "/api/admin/stats" : null
  );

  if (authLoading) return <LoadingBlock />;
  if (!user || user.role !== "admin")
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🚫</p>
        <p className="mt-4 text-slate-600">Bạn không có quyền truy cập trang quản trị.</p>
      </div>
    );

  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển</h1>

      {loading && <LoadingBlock />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {stats && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Người dùng" value={stats.users} />
            <StatCard label="Khóa học" value={stats.courses} />
            <StatCard label="Đăng ký" value={stats.enrollments} />
            <StatCard label="Bài viết" value={stats.posts} />
            <StatCard label="Doanh thu" value={formatVND(stats.revenue)} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href="/admin/courses">
              <Card className="p-6 text-center transition hover:shadow-md">
                <span className="text-3xl">📚</span>
                <p className="mt-2 font-semibold text-slate-700">Quản lý khóa học</p>
              </Card>
            </Link>
            <Link href="/admin/users">
              <Card className="p-6 text-center transition hover:shadow-md">
                <span className="text-3xl">👥</span>
                <p className="mt-2 font-semibold text-slate-700">Quản lý người dùng</p>
              </Card>
            </Link>
            <Link href="/admin/orders">
              <Card className="p-6 text-center transition hover:shadow-md">
                <span className="text-3xl">💳</span>
                <p className="mt-2 font-semibold text-slate-700">Đơn hàng</p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </Card>
  );
}
