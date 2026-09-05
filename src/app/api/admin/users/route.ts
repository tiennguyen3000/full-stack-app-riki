import { db } from "@/db";
import { users, enrollments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError, parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);

  const url = new URL(req.url);
  const p = parsePagination(url.searchParams);

  const [{ value: total }] = await db.select({ value: sql<number>`count(*)` }).from(users);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      level: users.level,
      coins: users.coins,
      createdAt: users.createdAt,
      enrollmentCount: sql<number>`(select count(*) from ${enrollments} where ${enrollments.userId} = ${users.id})::int`,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, Number(total), p));
}
