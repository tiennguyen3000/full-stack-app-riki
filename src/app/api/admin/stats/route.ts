import { db } from "@/db";
import { users, courses, orders, enrollments, posts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);

  const [userCount] = await db.select({ v: sql<number>`count(*)::int` }).from(users);
  const [courseCount] = await db.select({ v: sql<number>`count(*)::int` }).from(courses);
  const [enrollmentCount] = await db.select({ v: sql<number>`count(*)::int` }).from(enrollments);
  const [postCount] = await db.select({ v: sql<number>`count(*)::int` }).from(posts);
  const [revenue] = await db
    .select({ v: sql<number>`coalesce(sum(${orders.amount}), 0)::int` })
    .from(orders)
    .where(sql`${orders.status} = 'paid'`);

  return Response.json({
    stats: {
      users: Number(userCount.v),
      courses: Number(courseCount.v),
      enrollments: Number(enrollmentCount.v),
      posts: Number(postCount.v),
      revenue: Number(revenue.v),
    },
  });
}
