"use client";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-rose-600">Riki Nihongo</Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/courses" className="hover:text-rose-600">Khóa học</Link>
          <Link href="/blog" className="hover:text-rose-600">Góc chia sẻ</Link>
          <Link href="/tests" className="hover:text-rose-600">Thi thử</Link>
          <Link href="/flashcards" className="hover:text-rose-600">Flashcard</Link>
          {user?.role === "admin" && <Link href="/admin" className="text-rose-600">Quản trị</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-slate-700">{user.name}</Link>
              <button onClick={async () => { await logout(); router.push("/"); router.refresh(); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Đăng nhập</Link>
              <Link href="/register" className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">© 2026 Riki Nihongo — Hệ thống Nhật ngữ · 11 cơ sở Hà Nội & HCM</footer>;
}
