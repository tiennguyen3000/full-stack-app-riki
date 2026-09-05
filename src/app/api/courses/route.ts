import { db } from "@/db";
import { courses, categories, enrollments } from "@/db/schema";
import { and, eq, ilike, asc, desc, count } from "drizzle-orm";
import { parsePagination, paginated } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const p = parsePagination(sp);

  const level = sp.get("level");
  const category = sp.get("category");
  const search = sp.get("search")?.trim();
  const featured = sp.get("featured");
  const sort = sp.get("sort") ?? "createdAt";
  const order = sp.get("order") ?? "desc";

  const conditions = [eq(courses.isActive, true)];
  if (level) conditions.push(eq(courses.level, level));
  if (category) conditions.push(eq(categories.slug, category));
  if (featured === "true") conditions.push(eq(courses.isFeatured, true));
  if (search) conditions.push(ilike(courses.title, `%${search}%`));

  const orderBy =
    sort === "price"
      ? order === "asc"
        ? asc(courses.price)
        : desc(courses.price)
      : sort === "title"
        ? order === "asc"
          ? asc(courses.title)
          : desc(courses.title)
        : desc(courses.createdAt);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(courses)
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(...conditions));

  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      level: courses.level,
      price: courses.price,
      originalPrice: courses.originalPrice,
      duration: courses.duration,
      sessions: courses.sessions,
      thumbnail: courses.thumbnail,
      highlights: courses.highlights,
      isFeatured: courses.isFeatured,
      createdAt: courses.createdAt,
      category: categories.name,
      categorySlug: categories.slug,
    })
    .from(courses)
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  // Attach enrolled flag for current user
  let enrolledIds = new Set<string>();
  const session = await getCurrentUser();
  if (session) {
    const enrolled = await db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, session.userId),
          eq(enrollments.status, "active")
        )
      );
    enrolledIds = new Set(enrolled.map((e) => e.courseId));
  }

  const data = rows.map((r) => ({
    ...r,
    enrolled: enrolledIds.has(r.id),
  }));

  return Response.json(paginated(data, total, p));
}
