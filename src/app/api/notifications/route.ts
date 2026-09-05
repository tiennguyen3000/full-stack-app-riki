import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return Response.json({ data: rows });
}

export async function POST() {
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, session.userId));

  return Response.json({ ok: true });
}
