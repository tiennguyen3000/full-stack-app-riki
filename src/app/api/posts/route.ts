import { db } from "@/db";
import { posts, postCategories, users } from "@/db/schema";
import { eq, and, ilike, desc, count, sql } from "drizzle-orm";
import { parsePagination, paginated } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;
  const p = parsePagination(sp);
  const category = sp.get("category");
  const search = sp.get("search")?.trim();

  const conditions = [eq(posts.status, "published")];
  if (category) conditions.push(eq(postCategories.slug, category));
  if (search) conditions.push(ilike(posts.title, `%${search}%`));

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(posts)
    .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .where(and(...conditions));

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
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
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt))
    .limit(p.pageSize)
    .offset((p.page - 1) * p.pageSize);

  return Response.json(paginated(rows, total, p));
}
