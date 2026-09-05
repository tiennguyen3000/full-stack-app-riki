"use client";

import Link from "next/link";
import { useFetch, formatVND, type Paginated } from "@/lib/client";
import { SkeletonCard, Badge, Card, LinkButton } from "@/components/ui";

type CourseCard = {
  id: string;
  title: string;
  slug: string;
  level: string;
  price: number;
  originalPrice: number | null;
  duration: string;
  sessions: number;
};

type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  author: string | null;
};

const stats = [
  { value: "18.000+", label: "Học viên đạt chứng chỉ" },
  { value: "98%", label: "Đạt chuẩn đầu ra" },
  { value: "11", label: "Cơ sở Hà Nội & HCM" },
  { value: "5+", label: "Năm kinh nghiệm" },
];

const levels = ["N5", "N4", "N3", "N2", "N1", "Kaiwa", "Business"];

export default function Home() {
  const featured = useFetch<Paginated<CourseCard>>(
    "/api/courses?featured=true&pageSize=6&sort=price&order=asc"
  );
  const posts = useFetch<Paginated<PostCard>>("/api/posts?pageSize=3");

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-100">
            リ · 学びましょう
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Cam kết đỗ JLPT mọi trình độ chỉ từ 2,5 tháng
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-rose-50">
            Hệ thống học tiếng Nhật online với lộ trình chuyên sâu từ N5 đến N1,
            đội ngũ giáo viên Nhật - Việt giàu kinh nghiệm.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-rose-600 hover:bg-rose-50"
            >
              Khám phá khóa học
            </Link>
            <Link
              href="/tests"
              className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Thi thử JLPT miễn phí
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {levels.map((l) => (
              <Link
                key={l}
                href={`/courses?level=${l}`}
                className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium hover:bg-white/25"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-rose-600">{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Khóa học nổi bật</h2>
            <p className="mt-1 text-slate-500">Lộ trình tối ưu cho mọi trình độ</p>
          </div>
          <LinkButton href="/courses" variant="secondary" size="sm">
            Xem tất cả
          </LinkButton>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          {featured.data?.data.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-rose-500 to-orange-400 text-4xl font-bold text-white">
                {c.level}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Badge color="rose">{c.level}</Badge>
                  <span className="text-xs text-slate-400">{c.sessions} buổi</span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-800">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{c.duration}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-600">{formatVND(c.price)}</span>
                    {c.originalPrice && (
                      <span className="ml-2 text-xs text-slate-400 line-through">
                        {formatVND(c.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Link href={`/courses/${c.slug}`} className="text-sm font-semibold text-rose-600 hover:underline">
                    Chi tiết →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Blog preview */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Góc chia sẻ</h2>
              <p className="mt-1 text-slate-500">Kiến thức và mẹo luyện thi hữu ích</p>
            </div>
            <LinkButton href="/blog" variant="secondary" size="sm">
              Xem tất cả
            </LinkButton>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.loading &&
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            {posts.data?.data.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group">
                <Card className="h-full p-5 transition group-hover:shadow-md">
                  {p.category && <Badge color="blue">{p.category}</Badge>}
                  <h3 className="mt-3 font-semibold text-slate-800 group-hover:text-rose-600">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{p.excerpt}</p>
                  <p className="mt-3 text-xs text-slate-400">{p.author ?? "Mon Sensei"}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
