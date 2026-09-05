import { db } from "@/db";
import { posts, comments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { commentSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (!post) return apiError("Không tìm thấy bài viết", 404);

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }

  const session = await getCurrentUser();
  let name = parsed.data.name ?? "Khách";
  let userId: string | null = null;
  if (session) {
    userId = session.userId;
    name = session.name;
    // Use DB name if available
    const [u] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (u) name = u.name;
  }

  const [comment] = await db
    .insert(comments)
    .values({ postId: post.id, userId, name, content: parsed.data.content })
    .returning();

  return Response.json({ comment }, { status: 201 });
}
