"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch, api, ApiError } from "@/lib/client";
import {
  Card,
  Button,
  Input,
  Textarea,
  Field,
  Alert,
  LoadingBlock,
  ErrorState,
  EmptyState,
  Badge,
} from "@/components/ui";

type CardItem = {
  id: string;
  front: string;
  reading: string | null;
  back: string;
  example: string | null;
  exampleMeaning: string | null;
};

type FolderDetail = {
  folder: { id: string; name: string; isPublic: boolean; isOwner: boolean };
  cards: CardItem[];
};

export default function FlashcardFolderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const { data, loading, error, reload } = useFetch<FolderDetail>(
    id ? `/api/flashcards/${id}` : null
  );

  const [form, setForm] = useState({ front: "", reading: "", back: "", example: "", exampleMeaning: "" });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Study mode
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState(false);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setFormError(null);
    try {
      await api(`/api/flashcards/${id}/cards`, {
        method: "POST",
        body: JSON.stringify({
          front: form.front,
          reading: form.reading || null,
          back: form.back,
          example: form.example || null,
          exampleMeaning: form.exampleMeaning || null,
        }),
      });
      setForm({ front: "", reading: "", back: "", example: "", exampleMeaning: "" });
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Đã xảy ra lỗi");
    } finally {
      setAdding(false);
    }
  }

  async function deleteFolder() {
    if (!confirm("Xóa bộ thẻ này và tất cả thẻ bên trong?")) return;
    await api(`/api/flashcards/${id}`, { method: "DELETE" });
    router.push("/flashcards");
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { folder, cards } = data;

  if (studyMode && cards.length > 0) {
    const card = cards[studyIndex];
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{folder.name}</h1>
          <div className="flex gap-2">
            <span className="text-sm text-slate-500">{studyIndex + 1}/{cards.length}</span>
            <Button variant="secondary" size="sm" onClick={() => { setStudyMode(false); setFlipped(false); }}>
              Thoát
            </Button>
          </div>
        </div>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="mt-8 block w-full cursor-pointer rounded-2xl border-2 border-rose-200 bg-white p-10 text-center shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs uppercase tracking-widest text-slate-400">
            {flipped ? "Nghĩa" : "Tiếng Nhật"}
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-800">{flipped ? card.back : card.front}</p>
          {!flipped && card.reading && (
            <p className="mt-2 text-lg text-rose-500">{card.reading}</p>
          )}
          {flipped && card.example && (
            <p className="mt-4 text-sm text-slate-500">
              {card.example} — {card.exampleMeaning}
            </p>
          )}
          <p className="mt-6 text-xs text-slate-400">Nhấn để lật thẻ</p>
        </button>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => { setStudyIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}>
            ← Trước
          </Button>
          <Button onClick={() => { setStudyIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}>
            Sau →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-800">{folder.name}</h1>
            {folder.isPublic && <Badge color="green">Công khai</Badge>}
          </div>
          <p className="mt-1 text-slate-500">{cards.length} thẻ</p>
        </div>
        <div className="flex gap-2">
          {cards.length > 0 && (
            <Button onClick={() => { setStudyIndex(0); setFlipped(false); setStudyMode(true); }}>
              🎓 Học thẻ
            </Button>
          )}
          {folder.isOwner && (
            <Button variant="danger" onClick={deleteFolder}>
              Xóa bộ thẻ
            </Button>
          )}
        </div>
      </div>

      {/* Add card (owner only) */}
      {folder.isOwner && (
        <Card className="mt-6 p-6">
          <h2 className="font-semibold text-slate-700">Thêm thẻ mới</h2>
          <form onSubmit={addCard} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Mặt trước (Tiếng Nhật)">
              <Input value={form.front} onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))} placeholder="ありがとう" required />
            </Field>
            <Field label="Cách đọc (Kana)">
              <Input value={form.reading} onChange={(e) => setForm((f) => ({ ...f, reading: e.target.value }))} placeholder="arigatou" />
            </Field>
            <Field label="Nghĩa (Tiếng Việt)">
              <Input value={form.back} onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))} placeholder="Cảm ơn" required />
            </Field>
            <Field label="Ví dụ">
              <Input value={form.example} onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))} placeholder="ありがとうございます。" />
            </Field>
            <Field label="Nghĩa ví dụ">
              <Textarea value={form.exampleMeaning} onChange={(e) => setForm((f) => ({ ...f, exampleMeaning: e.target.value }))} placeholder="Xin cảm ơn." />
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={adding}>
                {adding ? "Đang thêm..." : "Thêm thẻ"}
              </Button>
            </div>
          </form>
          {formError && <div className="mt-3"><Alert>{formError}</Alert></div>}
        </Card>
      )}

      {/* Cards list */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState title="Chưa có thẻ nào" description="Thêm thẻ đầu tiên để bắt đầu học." />
          </div>
        )}
        {cards.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-800">{c.front}</span>
              {c.reading && <span className="text-sm text-rose-500">{c.reading}</span>}
            </div>
            <p className="mt-1 text-slate-600">{c.back}</p>
            {c.example && (
              <p className="mt-2 text-xs text-slate-400">
                {c.example} — {c.exampleMeaning}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
