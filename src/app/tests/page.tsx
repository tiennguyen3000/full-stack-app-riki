"use client";
import Link from "next/link";
import { useState } from "react";
import { useFetch, type Paginated } from "@/lib/client";
import { Card, Badge, SkeletonCard, EmptyState, ErrorState, LoadingBlock, Pagination } from "@/components/ui";

type TestRow = { id: string; title: string; slug: string; level: string; durationMinutes: number; questionCount: number };
export default function TestsPage() {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const url = `/api/tests?page=${page}&pageSize=12${level ? `&level=${level}` : ""}`;
  const { data, loading, error, reload } = useFetch<Paginated<TestRow>>(url);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800">Thi thử JLPT</h1>
      <div className="mt-4 flex gap-2">
        {["", "N5","N4","N3","N2","N1"].map(l => (
          <button key={l||"all"} onClick={()=>{setLevel(l); setPage(1);}} className={`rounded-full px-4 py-1.5 text-sm ${level===l ? "bg-rose-600 text-white" : "bg-white border border-slate-200"}`}>{l||"Tất cả"}</button>
        ))}
      </div>
      <div className="mt-6">
        {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/> )}</div>}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && data.data.length===0 && <EmptyState title="Chưa có đề thi" />}
        {!loading && !error && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map(t => (
              <Link key={t.id} href={`/tests/${t.id}`}>
                <Card className="p-5 hover:shadow-md">
                  <Badge color="rose">{t.level}</Badge>
                  <h3 className="mt-2 font-semibold text-slate-800">{t.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{t.questionCount} câu · {t.durationMinutes} phút</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {data && <div className="mt-6"><Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} /></div>}
      </div>
    </div>
  );
}
