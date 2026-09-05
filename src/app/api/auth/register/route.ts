import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { apiError, readJson } from "@/lib/api";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }
  const { name, email, password, level } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return apiError("Email đã được đăng ký", 409);
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, level: level ?? null })
    .returning();

  const token = await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return Response.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role, coins: user.coins } },
    { status: 201 }
  );
}
