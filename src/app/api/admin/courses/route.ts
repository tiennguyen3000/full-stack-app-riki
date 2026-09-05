import { db } from "@/db";
import { courses, categories, enrollments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { courseCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** List all courses (including inactive) for admin. */
export async function GET() {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      level: courses.level,
      price: courses.price,
      isActive: courses.isActive,
      isFeatured: courses.isFeatured,
      category: categories.name,
      createdAt: courses.createdAt,
      enrollmentCount: sql<number>`(select count(*) from ${enrollments} where ${enrollments.courseId} = ${courses.id})::int`,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .orderBy(desc(courses.createdAt));

  return Response.json({ data: rows });
}

/** Create a course. */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);
  const parsed = courseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.slug, parsed.data.slug))
    .limit(1);
  if (existing.length > 0) return apiError("Slug đã tồn tại", 409);

  const [course] = await db
    .insert(courses)
    .values({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      level: parsed.data.level,
      price: parsed.data.price,
      originalPrice: parsed.data.originalPrice ?? null,
      duration: parsed.data.duration,
      sessions: parsed.data.sessions,
      thumbnail: parsed.data.thumbnail ?? null,
      highlights: parsed.data.highlights ?? [],
      outcomes: parsed.data.outcomes ?? null,
      isActive: parsed.data.isActive ?? true,
      isFeatured: parsed.data.isFeatured ?? false,
    })
    .returning();

  return Response.json({ course }, { status: 201 });
}
