import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { apiError, readJson } from "@/lib/api";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }
  const { email, password } = parsed.data;

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return apiError("Email hoặc mật khẩu không đúng", 401);
  }

  const token = await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level,
      coins: user.coins,
    },
  });
}
