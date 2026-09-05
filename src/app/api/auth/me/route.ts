import { getCurrentUser, getUserRow } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return Response.json({ user: null });
  }
  const row = await getUserRow(session.userId);
  return Response.json({
    user: row
      ? {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          level: row.level,
          coins: row.coins,
        }
      : null,
  });
}
