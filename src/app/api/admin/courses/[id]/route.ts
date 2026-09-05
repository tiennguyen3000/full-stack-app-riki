import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Update a course (partial), e.g. toggle isActive / isFeatured. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);
  const { id } = await params;

  const body = (await readJson(req)) as Record<string, unknown> | null;
  if (!body) return apiError("Thiếu dữ liệu", 400);

  const allowed: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (typeof body.isFeatured === "boolean") allowed.isFeatured = body.isFeatured;
  if (typeof body.price === "number") allowed.price = body.price;
  if (typeof body.title === "string") allowed.title = body.title;
  if (typeof body.description === "string") allowed.description = body.description;

  if (Object.keys(allowed).length === 0) {
    return apiError("Không có trường hợp lệ để cập nhật", 400);
  }

  const [updated] = await db
    .update(courses)
    .set(allowed)
    .where(eq(courses.id, id))
    .returning();

  if (!updated) return apiError("Không tìm thấy khóa học", 404);
  return Response.json({ course: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return apiError("Không có quyền truy cập", 403);
  const { id } = await params;

  const [deleted] = await db
    .delete(courses)
    .where(eq(courses.id, id))
    .returning({ id: courses.id });
  if (!deleted) return apiError("Không tìm thấy khóa học", 404);

  return Response.json({ ok: true });
}
