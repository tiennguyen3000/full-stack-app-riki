"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useFetch, api, formatDate, ApiError } from "@/lib/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  Badge,
  Button,
  Textarea,
  Field,
  Alert,
  LoadingBlock,
  ErrorState,
} from "@/components/ui";

type Comment = { id: string; name: string; content: string; createdAt: string };
type PostDetail = {
  post: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    views: number;
    publishedAt: string;
    category: string | null;
    author: string | null;
  };
  comments: Comment[];
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { user } = useAuth();

  const { data, loading, error, reload } = useFetch<PostDetail>(
    slug ? `/api/posts/${slug}` : null
  );

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentOk, setCommentOk] = useState(false);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setCommentError(null);
    setCommentOk(false);
    try {
      await api(`/api/posts/${slug}/comments`, {
        method: "POST",
        body: JSON.stringify({ name: user ? undefined : name, content }),
      });
      setContent("");
      setName("");
      setCommentOk(true);
      reload();
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingBlock text="Đang tải bài viết..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { post, comments } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2">
        {post.category && <Badge color="blue">{post.category}</Badge>}
        <span className="text-sm text-slate-400">{formatDate(post.publishedAt)}</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold text-slate-800">{post.title}</h1>
      <p className="mt-2 text-slate-500">
        Tác giả: <span className="font-medium">{post.author ?? "Mon Sensei"}</span> · {post.views.toLocaleString("vi-VN")} lượt xem
      </p>

      <article className="mt-6 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-6 leading-relaxed text-slate-700">
        {post.content}
      </article>

      {/* Comments */}
      <h2 className="mt-10 text-xl font-bold text-slate-800">Bình luận ({comments.length})</h2>
      <div className="mt-4 space-y-3">
        {comments.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                {c.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                <p className="text-xs text-slate-400">{formatDate(c.createdAt)}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{c.content}</p>
          </Card>
        ))}
      </div>

      {/* Comment form */}
      <Card className="mt-6 p-6">
        <h3 className="font-semibold text-slate-700">Để lại bình luận</h3>
        <form onSubmit={submitComment} className="mt-4 space-y-3">
          {!user && (
            <Field label="Tên của bạn">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên hiển thị"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </Field>
          )}
          <Field label="Nội dung">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} required />
          </Field>
          {commentError && <Alert>{commentError}</Alert>}
          {commentOk && <Alert tone="success">Bình luận đã được đăng</Alert>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
