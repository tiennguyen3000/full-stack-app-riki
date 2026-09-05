import { db } from "@/db";
import { flashcardFolders, flashcards } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { folderCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** List folders (own folders + public folders from other users). */
export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "all"; // all | mine | public

  const conditions: any[] = [];
  if (scope === "mine") {
    conditions.push(eq(flashcardFolders.userId, session.userId));
  } else if (scope === "public") {
    conditions.push(eq(flashcardFolders.isPublic, true));
  } else {
    conditions.push(
      sql`(${flashcardFolders.userId} = ${session.userId} or ${flashcardFolders.isPublic} = true)`
    );
  }

  const folders = await db
    .select({
      id: flashcardFolders.id,
      name: flashcardFolders.name,
      isPublic: flashcardFolders.isPublic,
      createdAt: flashcardFolders.createdAt,
      userId: flashcardFolders.userId,
      cardCount: sql<number>`count(${flashcards.id})::int`,
    })
    .from(flashcardFolders)
    .leftJoin(flashcards, eq(flashcards.folderId, flashcardFolders.id))
    .where(and(...conditions))
    .groupBy(flashcardFolders.id)
    .orderBy(desc(flashcardFolders.createdAt));

  return Response.json({
    data: folders.map((f) => ({ ...f, isOwner: f.userId === session.userId })),
  });
}

/** Create a folder. */
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);
  const parsed = folderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }

  const [folder] = await db
    .insert(flashcardFolders)
    .values({
      userId: session.userId,
      name: parsed.data.name,
      isPublic: parsed.data.isPublic,
    })
    .returning();

  return Response.json({ folder }, { status: 201 });
}
