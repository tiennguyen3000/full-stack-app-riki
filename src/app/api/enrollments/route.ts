import { db } from "@/db";
import {
  courses,
  categories,
  enrollments,
  orders,
  vouchers,
  users,
  notifications,
} from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { enrollSchema } from "@/lib/validation";
import { apiError, readJson, parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * Enroll a user into a course. Business rules:
 *  - course must exist and be active
 *  - no existing active enrollment for the same user+course
 *  - optional voucher must be valid (active, not expired, meets min amount)
 *  - creates a pending Order -> simulated payment -> paid
 *  - creates active Enrollment, awards loyalty coins, sends a notification
 */
export async function POST(req: Request) {
  const session = await requireUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);

  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }
  const { courseId, paymentMethod, voucherCode } = parsed.data;

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) return apiError("Khóa học không tồn tại", 404);
  if (!course.isActive) return apiError("Khóa học hiện không mở đăng ký", 422);

  const existing = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, session.userId),
        eq(enrollments.courseId, courseId),
        eq(enrollments.status, "active")
      )
    )
    .limit(1);
  if (existing.length > 0) {
    return apiError("Bạn đã đăng ký khóa học này", 409);
  }

  // Voucher validation
  let discount = 0;
  if (voucherCode) {
    const [voucher] = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.code, voucherCode))
      .limit(1);
    if (!voucher || !voucher.isActive) {
      return apiError("Mã giảm giá không hợp lệ", 422);
    }
    if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
      return apiError("Mã giảm giá đã hết hạn", 422);
    }
    if (course.price < voucher.minAmount) {
      return apiError(`Mã giảm giá chỉ áp dụng cho đơn từ ${voucher.minAmount.toLocaleString("vi-VN")}đ`, 422);
    }
    discount = Math.round((course.price * voucher.discountPercent) / 100);
  }

  const amount = Math.max(0, course.price - discount);
  const code = `RK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

  // Simulated payment gateway: succeeds for demo purposes.
  const paymentOk = true;

  const [order] = await db
    .insert(orders)
    .values({
      code,
      userId: session.userId,
      courseId,
      amount,
      discount,
      status: paymentOk ? "paid" : "failed",
      paymentMethod,
      voucherCode: voucherCode ?? null,
      paidAt: paymentOk ? new Date() : null,
    })
    .returning();

  if (!paymentOk) {
    return apiError("Thanh toán không thành công. Vui lòng thử lại.", 402);
  }

  const [enrollment] = await db
    .insert(enrollments)
    .values({ userId: session.userId, courseId, status: "active", progress: 0 })
    .returning();

  // Award loyalty coins (10 per 100,000 VND, min 10)
  const coinsAwarded = Math.max(10, Math.floor(amount / 100000) * 10);
  await db
    .update(users)
    .set({ coins: sql`${users.coins} + ${coinsAwarded}` })
    .where(eq(users.id, session.userId));

  await db.insert(notifications).values({
    userId: session.userId,
    title: "Đăng ký khóa học thành công",
    content: `Bạn đã đăng ký "${course.title}" thành công. Nhận +${coinsAwarded} Riki Coin.`,
    type: "success",
  });

  return Response.json(
    {
      enrollment: { id: enrollment.id, status: enrollment.status, progress: 0 },
      order: { code: order.code, amount, discount, status: order.status },
      coinsAwarded,
    },
    { status: 201 }
  );
}

/** List current user's enrollments with course details. */
export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const url = new URL(req.url);
  const p = parsePagination(url.searchParams);

  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(enrollments)
    .where(eq(enrollments.userId, session.userId));

  const rows = await db
    .select({
      id: enrollments.id,
      status: enrollments.status,
      progress: enrollments.progress,
      enrolledAt: enrollments.enrolledAt,
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      level: courses.level,
      duration: courses.duration,
      thumbnail: courses.thumbnail,
      category: categories.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(enrollments.userId, session.userId))
    .orderBy(sql`${enrollments.enrolledAt} desc`)
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, Number(total), p));
}
