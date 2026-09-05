import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return Response.json({ data: rows });
}
