import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Get a folder with its cards. Private folders require ownership. */
export async function GET(
  _req: Request,
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
  if (!folder.isPublic && folder.userId !== session.userId) {
    return apiError("Bạn không có quyền xem bộ thẻ này", 403);
  }

  const cards = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.folderId, id))
    .orderBy(asc(flashcards.createdAt));

  return Response.json({
    folder: { ...folder, isOwner: folder.userId === session.userId },
    cards,
  });
}

/** Delete a folder (owner only). */
export async function DELETE(
  _req: Request,
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
    return apiError("Bạn không có quyền xóa bộ thẻ này", 403);
  }

  await db.delete(flashcardFolders).where(eq(flashcardFolders.id, id));
  return Response.json({ ok: true });
}
