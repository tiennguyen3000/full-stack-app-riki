import { db } from "@/db";
import { orders, courses, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError, parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);

  const url = new URL(req.url);
  const p = parsePagination(url.searchParams);

  const [{ value: total }] = await db.select({ value: sql<number>`count(*)` }).from(orders);

  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      amount: orders.amount,
      discount: orders.discount,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      courseTitle: courses.title,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(courses, eq(orders.courseId, courses.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, Number(total), p));
}
