import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { flashcardCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Add a card to a folder (owner only). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const [folder] = await db
    .select()
    .from(flashcardFolders)
    .where(eq(flashcardFolders.id, id))
    .limit(1);
  if (!folder) return apiError("Không tìm thấy bộ thẻ", 404);
  if (folder.userId !== session.userId) {
    return apiError("Bạn không có quyền thêm thẻ vào bộ này", 403);
  }

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);
  const parsed = flashcardCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }

  const [card] = await db
    .insert(flashcards)
    .values({ folderId: id, ...parsed.data })
    .returning();

  return Response.json({ card }, { status: 201 });
}
