import { db } from "@/db";
import { tests, questions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const p = parsePagination(sp);
  const level = sp.get("level");

  const conditions = level ? [eq(tests.level, level)] : [];

  const [{ value: total }] = await db
    .select({ value: sql<number>`count(*)` })
    .from(tests)
    .where(conditions.length ? eq(tests.level, level!) : undefined);

  const rows = await db
    .select({
      id: tests.id,
      title: tests.title,
      slug: tests.slug,
      level: tests.level,
      description: tests.description,
      durationMinutes: tests.durationMinutes,
      createdAt: tests.createdAt,
      questionCount: sql<number>`(select count(*) from ${questions} where ${questions.testId} = ${tests.id})::int`,
    })
    .from(tests)
    .where(conditions.length ? eq(tests.level, level!) : undefined)
    .orderBy(desc(tests.createdAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, Number(total), p));
}
