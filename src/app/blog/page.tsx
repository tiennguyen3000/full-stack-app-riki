"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFetch, formatDate, type Paginated } from "@/lib/client";
import { Card, Badge, Input, Button, SkeletonCard, EmptyState, ErrorState, Pagination } from "@/components/ui";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  views: number;
  publishedAt: string;
  category: string | null;
  categorySlug: string | null;
  author: string | null;
};

type Cat = { id: string; name: string; slug: string };

export default function BlogPage() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const cats = useFetch<{ data: Cat[] }>("/api/post-categories");

  const url = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: "9" });
    if (category) p.set("category", category);
    if (query) p.set("search", query);
    return `/api/posts?${p.toString()}`;
  }, [page, category, query]);

  const { data, loading, error, reload } = useFetch<Paginated<Post>>(url);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Góc chia sẻ</h1>
      <p className="mt-2 text-slate-500">Kiến thức tiếng Nhật và mẹo luyện thi JLPT</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); setQuery(search); setPage(1); }}
          className="flex flex-1 gap-2"
        >
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm bài viết..." />
          <Button type="submit" variant="secondary">Tìm</Button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => { setCategory(""); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${category === "" ? "bg-rose-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Tất cả
        </button>
        {cats.data?.data.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.slug); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${category === c.slug ? "bg-rose-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && data.data.length === 0 && (
          <EmptyState title="Không tìm thấy bài viết" />
        )}
        {!loading && !error && data?.data.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group">
            <Card className="flex h-full flex-col p-5 transition hover:shadow-md">
              <div className="flex items-center gap-2">
                {p.category && <Badge color="blue">{p.category}</Badge>}
              </div>
              <h3 className="mt-3 font-semibold text-slate-800 group-hover:text-rose-600">{p.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>{p.author ?? "Mon Sensei"}</span>
                <span>{formatDate(p.publishedAt)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {data && (
        <div className="mt-8">
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
