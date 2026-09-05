import { db } from "@/db";
import { postCategories } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(postCategories).orderBy(asc(postCategories.name));
  return Response.json({ data: rows });
}
