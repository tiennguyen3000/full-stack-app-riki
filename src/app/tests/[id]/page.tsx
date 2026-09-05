"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useFetch, api, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import { Card, Button, Alert, LoadingBlock, ErrorState } from "@/components/ui";

type Detail = { test: { id: string; title: string; level: string; description: string | null; durationMinutes: number }; questions: { id: string; content: string; options: string[]; orderIndex: number }[]; totalQuestions: number };

export default function TestTakePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { data, loading, error, reload } = useFetch<Detail>(id ? `/api/tests/${id}` : null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  if (loading) return <LoadingBlock text="Đang tải đề thi..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const submit = async () => {
    if (!user) { router.push("/login"); return; }
    setSubmitting(true); setErr(null);
    try {
      const arr = data.questions.map((_, i) => answers[i] ?? -1);
      const j: any = await api(`/api/tests/${id}/submit`, { method: "POST", body: JSON.stringify({ answers: arr }) });
      setResult(j);
    } catch (e) { setErr(e instanceof ApiError ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Kết quả</h2>
          <p className="mt-2 text-5xl font-bold text-rose-600">{result.attempt.score}/{result.attempt.total}</p>
          <p className="mt-2 text-slate-500">Bạn đã hoàn thành bài thi</p>
          <Button className="mt-4" onClick={() => router.push("/tests")}>Về danh sách</Button>
        </Card>
        <div className="mt-6 space-y-3">
          {data.questions.map((q, i) => (
            <Card key={q.id} className="p-4">
              <p className="font-medium text-slate-700">{i + 1}. {q.content}</p>
              <p className="mt-1 text-sm text-slate-500">Bạn chọn: {q.options[answers[i]] ?? "Không chọn"} · Đáp án: {q.options[result.correct[i]]}</p>
              {result.explanations[i] && <p className="mt-1 text-xs text-emerald-600">{result.explanations[i]}</p>}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-800">{data.test.title}</h1>
      <p className="text-sm text-slate-500">{data.test.level} · {data.test.durationMinutes} phút · {data.totalQuestions} câu</p>
      <div className="mt-6 space-y-4">
        {data.questions.map((q, idx) => (
          <Card key={q.id} className="p-5">
            <p className="font-medium text-slate-800">{idx + 1}. {q.content}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${answers[idx]===oi ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}>
                  <input type="radio" name={`q-${idx}`} checked={answers[idx]===oi} onChange={()=>setAnswers(a=>({...a,[idx]:oi}))} />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {err && <div className="mt-4"><Alert>{err}</Alert></div>}
      <Button onClick={submit} disabled={submitting} className="mt-6 w-full">{submitting ? "Đang nộp..." : "Nộp bài"}</Button>
    </div>
  );
}
