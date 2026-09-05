import { db } from "@/db";
import { vouchers } from "@/db/schema";
import { eq, and, gte, or, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** List active, non-expired vouchers. */
export async function GET() {
  const now = new Date();
  const rows = await db
    .select({
      code: vouchers.code,
      discountPercent: vouchers.discountPercent,
      minAmount: vouchers.minAmount,
      expiresAt: vouchers.expiresAt,
    })
    .from(vouchers)
    .where(
      and(
        eq(vouchers.isActive, true),
        or(isNull(vouchers.expiresAt), gte(vouchers.expiresAt, now))
      )
    );

  return Response.json({ data: rows });
}
