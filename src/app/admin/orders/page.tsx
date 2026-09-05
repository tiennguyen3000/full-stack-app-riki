"use client";

import { useFetch, formatVND, formatDate, type Paginated } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Card, Badge, LoadingBlock, ErrorState } from "@/components/ui";

type OrderRow = {
  id: string;
  code: string;
  amount: number;
  discount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  courseTitle: string;
  userName: string;
  userEmail: string;
};

const statusColor: Record<string, "green" | "amber" | "rose" | "slate"> = {
  paid: "green",
  pending: "amber",
  failed: "rose",
  refunded: "slate",
};

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<Paginated<OrderRow>>(
    user?.role === "admin" ? "/api/admin/orders?pageSize=50" : null
  );

  if (authLoading) return <LoadingBlock />;
  if (!user || user.role !== "admin")
    return <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">Không có quyền truy cập.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Đơn hàng</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Học viên</th>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6}><LoadingBlock /></td></tr>}
            {error && <tr><td colSpan={6}><ErrorState message={error} onRetry={reload} /></td></tr>}
            {!loading && !error && data?.data.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{o.code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700">{o.userName}</p>
                  <p className="text-xs text-slate-400">{o.userEmail}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">{o.courseTitle}</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{formatVND(o.amount)}</td>
                <td className="px-4 py-3"><Badge color={statusColor[o.status] ?? "slate"}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
