import { db } from "@/db";
import { posts, postCategories, users, comments } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      cover: posts.cover,
      views: posts.views,
      publishedAt: posts.publishedAt,
      category: postCategories.name,
      categorySlug: postCategories.slug,
      author: users.name,
    })
    .from(posts)
    .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  const post = rows[0];
  if (!post) return apiError("Không tìm thấy bài viết", 404);

  // Increment view count (fire-and-forget)
  void db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, post.id));

  const commentRows = await db
    .select({
      id: comments.id,
      name: comments.name,
      content: comments.content,
      createdAt: comments.createdAt,
      userId: comments.userId,
    })
    .from(comments)
    .where(eq(comments.postId, post.id))
    .orderBy(desc(comments.createdAt));

  return Response.json({ post, comments: commentRows });
}
