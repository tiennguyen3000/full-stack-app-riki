"use client";

import { useFetch, api, formatDate } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Card, Badge, Button, EmptyState, ErrorState, LoadingBlock } from "@/components/ui";

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<{ data: Notification[] }>(
    user ? "/api/notifications" : null
  );

  if (authLoading) return <LoadingBlock />;
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">
        Vui lòng đăng nhập để xem thông báo.
      </div>
    );

  async function markAllRead() {
    await api("/api/notifications", { method: "POST" });
    reload();
  }

  const notifs = data?.data ?? [];
  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Thông báo</h1>
          {unread > 0 && <p className="mt-1 text-sm text-slate-500">{unread} thông báo chưa đọc</p>}
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <LoadingBlock />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && notifs.length === 0 && (
          <EmptyState title="Không có thông báo" />
        )}
        {!loading && !error && notifs.map((n) => (
          <Card key={n.id} className={`p-4 ${n.isRead ? "opacity-70" : "border-rose-200"}`}>
            <div className="flex items-start gap-3">
              <span className="mt-1 text-xl">{n.type === "success" ? "✅" : "🔔"}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-700">{n.title}</p>
                  {!n.isRead && <Badge color="rose">Mới</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.content}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
