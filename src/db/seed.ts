import { db } from "./index";
import { users, categories, courses, lessons, tests, questions, postCategories, posts, vouchers } from "./schema";
import { hashPassword } from "@/lib/auth";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding...");

  // clean
  await db.execute(sql`truncate table test_attempts, questions, tests, flashcards, flashcard_folders, comments, posts, post_categories, orders, enrollments, lessons, courses, categories, vouchers, notifications, users cascade`);

  const pw = await hashPassword("password123");
  const [admin] = await db.insert(users).values({ name: "Admin Riki", email: "admin@riki.edu.vn", passwordHash: pw, role: "admin", coins: 1000 }).returning();
  const [sensei] = await db.insert(users).values({ name: "Mon Sensei", email: "sensei@riki.edu.vn", passwordHash: pw, role: "teacher", coins: 500 }).returning();
  const [student] = await db.insert(users).values({ name: "Học viên Demo", email: "student1@riki.edu.vn", passwordHash: pw, role: "student", level: "N5", coins: 200 }).returning();

  const cats = await db.insert(categories).values([
    { name: "Tiếng Nhật sơ cấp", slug: "so-cap", description: "N5-N4" },
    { name: "Tiếng Nhật trung cấp", slug: "trung-cap", description: "N3-N2" },
    { name: "Tiếng Nhật cao cấp", slug: "cao-cap", description: "N1" },
    { name: "Kaiwa", slug: "kaiwa" },
    { name: "Business", slug: "business" },
  ]).returning();

  const soCap = cats.find(c=>c.slug==="so-cap")!;
  const kaiwa = cats.find(c=>c.slug==="kaiwa")!;
  const business = cats.find(c=>c.slug==="business")!;

  const courseRows = await db.insert(courses).values([
    { title: "Khóa N5 - Nhập môn tiếng Nhật", slug: "khoa-n5-nhap-mon", description: "Lộ trình N5 toàn diện 3 tháng, 48 buổi, cam kết đỗ JLPT.", categoryId: soCap.id, level: "N5", price: 2500000, originalPrice: 3500000, duration: "3 tháng", sessions: 48, highlights: ["Giáo viên Nhật-Việt","Bài tập JLPT mỗi buổi"], isActive: true, isFeatured: true },
    { title: "Khóa N4 - Sơ cấp nâng cao", slug: "khoa-n4-nang-cao", description: "Nâng cao ngữ pháp N4, luyện đề JLPT.", categoryId: soCap.id, level: "N4", price: 3200000, duration: "3 tháng", sessions: 48, highlights: ["Luyện đề","Kaiwa"], isActive: true, isFeatured: true },
    { title: "Khóa N3 - Trung cấp", slug: "khoa-n3-trung-cap", description: "Chinh phục N3 trong 4 tháng.", categoryId: cats[1].id, level: "N3", price: 4500000, duration: "4 tháng", sessions: 64, highlights: ["Mock test"], isActive: true, isFeatured: true },
    { title: "Kaiwa giao tiếp", slug: "kaiwa-giao-tiep", description: "Giao tiếp tự tin với người Nhật.", categoryId: kaiwa.id, level: "Kaiwa", price: 2000000, duration: "2 tháng", sessions: 24, highlights: ["Luyện nói 1-1"], isActive: true, isFeatured: false },
    { title: "Business Japanese", slug: "business-japanese", description: "Tiếng Nhật thương mại.", categoryId: business.id, level: "Business", price: 5000000, duration: "2.5 tháng", sessions: 32, highlights: ["Keigo","Email"], isActive: true, isFeatured: false },
  ]).returning();

  for (const c of courseRows.slice(0,2)) {
    await db.insert(lessons).values([
      { courseId: c.id, title: "Bài 1: Chào hỏi", orderIndex: 1, content: "Konnichiwa..." },
      { courseId: c.id, title: "Bài 2: Ngữ pháp cơ bản", orderIndex: 2, content: "Ngữ pháp..." },
    ]);
  }

  const t = await db.insert(tests).values({ title: "Thi thử JLPT N5 - Đề 01", slug: "jlpt-n5-de-01", level: "N5", description: "Đề thi thử N5", durationMinutes: 60 }).returning();
  await db.insert(questions).values([
    { testId: t[0].id, content: "「ありがとう」の意味は？", options: ["Xin chào","Cảm ơn","Tạm biệt","Xin lỗi"], correctIndex: 1, explanation: "Arigatou = Cảm ơn", orderIndex: 1 },
    { testId: t[0].id, content: "「さくら」は何ですか？", options: ["Hoa anh đào","Hoa sen","Hoa cúc","Hoa mai"], correctIndex: 0, orderIndex: 2 },
    { testId: t[0].id, content: "Chọn đáp án đúng: わたし ___ がくせいです。", options: ["は","が","を","に"], correctIndex: 0, orderIndex: 3 },
  ]);

  const pc = await db.insert(postCategories).values([{ name: "Ngữ pháp", slug: "ngu-phap"},{ name: "Từ vựng", slug: "tu-vung"},{ name:"JLPT Tips", slug:"jlpt-tips"}]).returning();
  await db.insert(posts).values([
    { title: "10 cấu trúc ngữ pháp N5 hay gặp", slug: "10-cau-truc-n5", excerpt: "Tổng hợp cấu trúc N5 quan trọng", content: "Nội dung chi tiết về ngữ pháp N5...", categoryId: pc[0].id, authorId: sensei.id, status: "published", views: 1234 },
    { title: "Mẹo nhớ 100 từ vựng N5 nhanh", slug: "meo-nho-tu-vung-n5", excerpt: "Flashcard + spaced repetition", content: "Cách học từ vựng hiệu quả...", categoryId: pc[1].id, authorId: sensei.id, status: "published", views: 892 },
    { title: "Kinh nghiệm thi JLPT N3", slug: "kinh-nghiem-n3", excerpt: "Chia sẻ từ học viên đỗ N3", content: "Bí quyết luyện đề...", categoryId: pc[2].id, authorId: admin.id, status: "published", views: 2100 },
  ]);

  await db.insert(vouchers).values([
    { code: "RIKI10", discountPercent: 10, minAmount: 1000000, isActive: true },
    { code: "SALE20", discountPercent: 20, minAmount: 3000000, isActive: true },
  ]);

  console.log("Seed done. Accounts: admin@riki.edu.vn / sensei@riki.edu.vn / student1@riki.edu.vn — password: password123");
}

seed().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
