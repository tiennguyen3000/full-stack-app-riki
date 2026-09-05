import { db } from "@/db";
import { courses, categories, lessons, enrollments } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { apiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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
      outcomes: courses.outcomes,
      isActive: courses.isActive,
      createdAt: courses.createdAt,
      category: categories.name,
      categorySlug: categories.slug,
    })
    .from(courses)
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.slug, slug))
    .limit(1);

  const course = rows[0];
  if (!course) return apiError("Không tìm thấy khóa học", 404);

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, course.id))
    .orderBy(asc(lessons.orderIndex));

  let enrollment: any = null;
  const session = await getCurrentUser();
  if (session) {
    const e = await db
      .select()
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, session.userId), eq(enrollments.courseId, course.id))
      )
      .limit(1);
    enrollment = e[0] ?? null;
  }

  return Response.json({
    ...course,
    lessons: lessonRows,
    enrollment: enrollment
      ? { id: enrollment.id, status: enrollment.status, progress: enrollment.progress }
      : null,
  });
}
