import { db } from "@/db";
import { orders, courses } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError, parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const url = new URL(req.url);
  const sp = url.searchParams;
  const p = parsePagination(sp);
  const status = sp.get("status");

  const conditions = [eq(orders.userId, session.userId)];
  if (status) conditions.push(eq(orders.status, status as never));

  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(orders)
    .where(and(...conditions));

  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      amount: orders.amount,
      discount: orders.discount,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      voucherCode: orders.voucherCode,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(orders)
    .innerJoin(courses, eq(orders.courseId, courses.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, Number(total), p));
}
