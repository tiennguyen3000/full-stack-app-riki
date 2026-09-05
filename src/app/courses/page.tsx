"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFetch, formatVND, type Paginated } from "@/lib/client";
import {
  Card,
  Badge,
  Input,
  Button,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Pagination,
} from "@/components/ui";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  price: number;
  originalPrice: number | null;
  duration: string;
  sessions: number;
  category: string;
  enrolled: boolean;
};

const levels = ["Tất cả", "N5", "N4", "N3", "N2", "N1", "Kaiwa", "Business"];

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialLevel = searchParams.get("level") ?? "";
  const [level, setLevel] = useState(initialLevel);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "9");
    if (level) params.set("level", level);
    if (query) params.set("search", query);
    params.set("sort", sort);
    params.set("order", order);
    return `/api/courses?${params.toString()}`;
  }, [page, level, query, sort, order]);

  const { data, loading, error, reload } = useFetch<Paginated<Course>>(url);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Khóa học tiếng Nhật</h1>
      <p className="mt-2 text-slate-500">Chọn lộ trình phù hợp với trình độ của bạn</p>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLevel(l === "Tất cả" ? "" : l);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                (l === "Tất cả" ? "" : l) === level
                  ? "bg-rose-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-rose-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(1);
            }}
            className="flex flex-1 gap-2"
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
            />
            <Button type="submit" variant="secondary">
              Tìm
            </Button>
          </form>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="createdAt">Mới nhất</option>
              <option value="price">Giá</option>
              <option value="title">Tên</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}>
              {order === "asc" ? "↑ Tăng" : "↓ Giảm"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && data.data.length === 0 && (
          <EmptyState
            title="Không tìm thấy khóa học"
            description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm."
          />
        )}
        {!loading && !error && data && data.data.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Tìm thấy <span className="font-semibold">{data.meta.total}</span> khóa học
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`}>
                  <Card className="h-full overflow-hidden transition hover:shadow-md">
                    <div className="flex h-28 items-center justify-center bg-gradient-to-br from-rose-500 to-orange-400 text-3xl font-bold text-white">
                      {c.level}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge color="rose">{c.level}</Badge>
                        <Badge>{c.category}</Badge>
                        {c.enrolled && <Badge color="green">Đã đăng ký</Badge>}
                      </div>
                      <h3 className="mt-2 font-semibold text-slate-800">{c.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-rose-600">{formatVND(c.price)}</span>
                          {c.originalPrice && (
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              {formatVND(c.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{c.duration}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
