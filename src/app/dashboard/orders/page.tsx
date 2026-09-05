"use client";

import { useState } from "react";
import Link from "next/link";
import { useFetch, formatVND, formatDate, type Paginated } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  SkeletonCard,
  EmptyState,
  ErrorState,
  LoadingBlock,
  Pagination,
} from "@/components/ui";

type Order = {
  id: string;
  code: string;
  amount: number;
  discount: number;
  status: string;
  paymentMethod: string;
  voucherCode: string | null;
  createdAt: string;
  courseTitle: string;
  courseSlug: string;
};

const statusMap: Record<string, { label: string; color: "green" | "amber" | "slate" | "rose" }> = {
  paid: { label: "Đã thanh toán", color: "green" },
  pending: { label: "Chờ xử lý", color: "amber" },
  failed: { label: "Thất bại", color: "rose" },
  refunded: { label: "Đã hoàn tiền", color: "slate" },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const url = user
    ? `/api/orders?page=${page}&pageSize=10${status ? `&status=${status}` : ""}`
    : null;

  const { data, loading, error, reload } = useFetch<Paginated<Order>>(url);

  if (authLoading) return <LoadingBlock />;
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">
        Vui lòng đăng nhập để xem lịch sử thanh toán.
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Lịch sử thanh toán</h1>

      <div className="mt-6 flex gap-2">
        {["", "paid", "pending", "failed", "refunded"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              status === s ? "bg-rose-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {s === "" ? "Tất cả" : statusMap[s].label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && data.data.length === 0 && (
          <EmptyState title="Chưa có giao dịch nào" />
        )}
        {!loading && !error && data?.data.map((o) => {
          const s = statusMap[o.status] ?? { label: o.status, color: "slate" as const };
          return (
            <Card key={o.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/courses/${o.courseSlug}`} className="font-semibold text-slate-800 hover:text-rose-600">
                    {o.courseTitle}
                  </Link>
                  <p className="mt-1 text-xs text-slate-400">
                    Mã đơn: {o.code} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{formatVND(o.amount)}</div>
                  {o.discount > 0 && (
                    <div className="text-xs text-emerald-600">Đã giảm {formatVND(o.discount)}</div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge color={s.color}>{s.label}</Badge>
                <Badge>{o.paymentMethod === "momo" ? "Ví MoMo" : o.paymentMethod === "bank" ? "Ngân hàng" : "Tại trung tâm"}</Badge>
                {o.voucherCode && <Badge color="blue">🎟️ {o.voucherCode}</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      {data && (
        <div className="mt-6">
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
