"use client";

import { useState } from "react";
import Link from "next/link";
import { useFetch, api, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  Button,
  Input,
  Field,
  Alert,
  SkeletonCard,
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "@/components/ui";

type Folder = {
  id: string;
  name: string;
  isPublic: boolean;
  cardCount: number;
  isOwner: boolean;
};

export default function FlashcardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, reload } = useFetch<{ data: Folder[] }>(
    user ? "/api/flashcards?scope=all" : null
  );
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (authLoading) return <LoadingBlock />;
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-600">
        Vui lòng đăng nhập để quản lý flashcard.
      </div>
    );

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      await api("/api/flashcards", {
        method: "POST",
        body: JSON.stringify({ name, isPublic }),
      });
      setName("");
      setIsPublic(false);
      setMessage("Đã tạo bộ thẻ mới");
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Đã xảy ra lỗi");
    } finally {
      setCreating(false);
    }
  }

  const folders = data?.data ?? [];
  const mine = folders.filter((f) => f.isOwner);
  const publicFolders = folders.filter((f) => !f.isOwner && f.isPublic);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Flashcard</h1>
          <p className="mt-1 text-slate-500">Học từ vựng và Kanji theo phương pháp lặp lại</p>
        </div>
      </div>

      {/* Create form */}
      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-slate-700">Tạo bộ thẻ mới</h2>
        <form onSubmit={createFolder} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Tên bộ thẻ">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Từ vựng N5 - Bài 1" required />
            </Field>
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-600">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Công khai
          </label>
          <Button type="submit" disabled={creating}>
            {creating ? "Đang tạo..." : "Tạo"}
          </Button>
        </form>
        {formError && <div className="mt-3"><Alert>{formError}</Alert></div>}
        {message && <div className="mt-3"><Alert tone="success">{message}</Alert></div>}
      </Card>

      {/* My folders */}
      <h2 className="mt-10 text-xl font-bold text-slate-800">Bộ thẻ của tôi</h2>
      <div className="mt-4">
        {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && mine.length === 0 && (
          <EmptyState title="Chưa có bộ thẻ nào" description="Tạo bộ thẻ đầu tiên để bắt đầu học." />
        )}
        {!loading && !error && mine.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((f) => (
              <Link key={f.id} href={`/flashcards/${f.id}`}>
                <Card className="p-5 transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🃏</span>
                    {f.isPublic && <Badge color="green">Công khai</Badge>}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-800">{f.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.cardCount} thẻ</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Public folders */}
      {publicFolders.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold text-slate-800">Bộ thẻ cộng đồng</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicFolders.map((f) => (
              <Link key={f.id} href={`/flashcards/${f.id}`}>
                <Card className="p-5 transition hover:shadow-md">
                  <span className="text-2xl">🌐</span>
                  <h3 className="mt-2 font-semibold text-slate-800">{f.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{f.cardCount} thẻ</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
