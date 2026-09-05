"use client";

import Link from "next/link";
import { useFetch, type Paginated } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  SkeletonCard,
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/ui";

type Enrollment = {
  id: string;
  status: string;
  progress: number;
  enrolledAt: string;
  courseId: string;
  title: string;
  slug: string;
  level: string;
  category: string;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<Paginated<Enrollment>>(
    user ? "/api/enrollments?pageSize=50" : null
  );

  if (authLoading) return <LoadingBlock text="Đang tải..." />;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-4 text-slate-600">Bạn cần đăng nhập để xem trang cá nhân.</p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-rose-600 px-6 py-2 font-semibold text-white">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const enrollments = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Xin chào, {user.name} 👋</h1>
          <p className="mt-1 text-slate-500">Tiếp tục hành trình chinh phục JLPT của bạn</p>
        </div>
        <div className="flex gap-2">
          <CoinBadge coins={user.coins ?? 0} />
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickLink href="/flashcards" icon="🃏" label="Flashcard" />
        <QuickLink href="/tests" icon="📝" label="Thi thử JLPT" />
        <QuickLink href="/dashboard/orders" icon="💳" label="Lịch sử thanh toán" />
        <QuickLink href="/vouchers" icon="🎟️" label="Ưu đãi" />
        <QuickLink href="/notifications" icon="🔔" label="Thông báo" />
        <QuickLink href="/tinh-diem-jlpt" icon="🧮" label="Tính điểm JLPT" />
      </div>

      {/* My courses */}
      <h2 className="mt-12 text-2xl font-bold text-slate-800">Khóa học của tôi</h2>
      <div className="mt-6">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && enrollments.length === 0 && (
          <EmptyState
            title="Bạn chưa đăng ký khóa học nào"
            description="Khám phá các khóa học và bắt đầu học ngay hôm nay."
            action={
              <Link href="/courses" className="rounded-lg bg-rose-600 px-6 py-2 font-semibold text-white">
                Khám phá khóa học
              </Link>
            }
          />
        )}
        {!loading && !error && enrollments.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => (
              <Card key={e.id} className="p-5">
                <div className="flex items-center gap-2">
                  <Badge color="rose">{e.level}</Badge>
                  <Badge color="green">{e.status === "active" ? "Đang học" : e.status}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-800">{e.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{e.category}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tiến độ</span>
                    <span className="font-semibold">{e.progress}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-rose-600" style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
                <Link
                  href={`/courses/${e.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-rose-600 hover:underline"
                >
                  Vào học →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoinBadge({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
      <span className="text-lg">🪙</span>
      <span className="font-semibold text-amber-700">{coins.toLocaleString("vi-VN")} Coin</span>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href}>
      <Card className="flex items-center gap-3 p-4 transition hover:shadow-md">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </Card>
    </Link>
  );
}
