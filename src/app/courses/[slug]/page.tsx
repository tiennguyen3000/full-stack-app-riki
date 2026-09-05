"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch, api, formatVND, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  Button,
  Input,
  Field,
  Alert,
  LoadingBlock,
  ErrorState,
} from "@/components/ui";

type Lesson = {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  durationMinutes: number;
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  originalPrice: number | null;
  duration: string;
  sessions: number;
  highlights: string[];
  outcomes: string | null;
  category: string;
  lessons: Lesson[];
  enrollment: { id: string; status: string; progress: number } | null;
};

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();
  const router = useRouter();

  const { data, loading, error, reload } = useFetch<CourseDetail>(
    slug ? `/api/courses/${slug}` : null
  );

  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function enroll() {
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api<{ coinsAwarded: number; order: { amount: number; discount: number } }>(
        "/api/enrollments",
        {
          method: "POST",
          body: JSON.stringify({
            courseId: data!.id,
            paymentMethod,
            voucherCode: voucherCode || null,
          }),
        }
      );
      setResult({
        ok: true,
        message: `Đăng ký thành công! Tổng thanh toán ${formatVND(res.order.amount)} (giảm ${formatVND(res.order.discount)}), nhận +${res.coinsAwarded} Riki Coin.`,
      });
      reload();
    } catch (err) {
      setResult({ ok: false, message: err instanceof ApiError ? err.message : "Đã xảy ra lỗi" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingBlock text="Đang tải khóa học..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const c = data;
  const enrolled = c.enrollment?.status === "active";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge color="rose">{c.level}</Badge>
            <Badge>{c.category}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-800">{c.title}</h1>
          <p className="mt-3 text-slate-600">{c.description}</p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Thời lượng" value={c.duration} />
            <Stat label="Số buổi" value={`${c.sessions} buổi`} />
            <Stat label="Trình độ" value={c.level} />
          </div>

          <h2 className="mt-8 text-xl font-bold text-slate-800">Nội dung khóa học</h2>
          <div className="mt-4 space-y-2">
            {c.lessons.map((l, i) => (
              <Card key={l.id} className="flex items-center gap-4 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{l.title}</p>
                  <p className="text-xs text-slate-400">
                    {l.type === "video" ? "🎬 Video" : l.type === "quiz" ? "📝 Bài tập" : "📖 Đọc hiểu"} · {l.durationMinutes} phút
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {c.highlights.length > 0 && (
            <>
              <h2 className="mt-8 text-xl font-bold text-slate-800">Quyền lợi học viên</h2>
              <ul className="mt-4 space-y-2">
                {c.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600">
                    <span className="mt-1 text-rose-500">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-20 p-6">
            <div className="text-3xl font-bold text-rose-600">{formatVND(c.price)}</div>
            {c.originalPrice && (
              <div className="mt-1 text-sm text-slate-400 line-through">
                {formatVND(c.originalPrice)}
              </div>
            )}

            {enrolled ? (
              <div className="mt-4">
                <Alert tone="success">Bạn đã đăng ký khóa học này ✓</Alert>
                <div className="mt-4">
                  <p className="mb-1 text-sm text-slate-500">
                    Tiến độ: <span className="font-semibold text-slate-700">{c.enrollment!.progress}%</span>
                  </p>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-rose-600"
                      style={{ width: `${c.enrollment!.progress}%` }}
                    />
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={() => router.push("/dashboard")}>
                  Đi tới lớp học của tôi
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <Field label="Phương thức thanh toán">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="momo">Ví MoMo</option>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                    <option value="cod">Thanh toán tại trung tâm</option>
                  </select>
                </Field>
                <Field label="Mã giảm giá (tuỳ chọn)">
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="VD: RIKI10"
                  />
                </Field>
                {result && (
                  <Alert tone={result.ok ? "success" : "error"}>{result.message}</Alert>
                )}
                <Button className="w-full" onClick={enroll} disabled={submitting}>
                  {submitting ? "Đang xử lý..." : "Đăng ký ngay"}
                </Button>
                <p className="text-center text-xs text-slate-400">
                  {user ? "Thanh toán được mô phỏng cho mục đích demo" : "Bạn cần đăng nhập để đăng ký"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-700">{value}</p>
    </Card>
  );
}
