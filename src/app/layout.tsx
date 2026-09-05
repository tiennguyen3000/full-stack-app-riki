import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar, Footer } from "@/components/nav";

export const metadata: Metadata = {
  title: "Riki Nihongo - Trung tâm tiếng Nhật luyện thi JLPT",
  description:
    "Hệ thống học tiếng Nhật online: luyện thi JLPT N5-N1, flashcard, thi thử, khóa học Kaiwa và Business.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
