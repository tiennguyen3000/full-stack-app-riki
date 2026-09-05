import { db } from "@/db";
import { tests, questions, testAttempts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { testSubmitSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Submit answers, score the attempt, and persist it. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) return apiError("Vui lòng đăng nhập", 401);

  const [test] = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
  if (!test) return apiError("Không tìm thấy bài thi", 404);

  const body = await readJson(req);
  if (!body) return apiError("Thiếu dữ liệu", 400);
  const parsed = testSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("Dữ liệu không hợp lệ", 400, parsed.error.flatten().fieldErrors);
  }

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.testId, id))
    .orderBy(asc(questions.orderIndex));

  const answers = parsed.data.answers;
  let score = 0;
  qs.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  const [attempt] = await db
    .insert(testAttempts)
    .values({
      userId: session.userId,
      testId: id,
      score,
      total: qs.length,
      answers,
      durationSeconds: parsed.data.durationSeconds ?? 0,
    })
    .returning();

  return Response.json(
    {
      attempt: {
        id: attempt.id,
        score,
        total: qs.length,
        durationSeconds: attempt.durationSeconds,
        submittedAt: attempt.submittedAt,
      },
      correct: qs.map((q) => q.correctIndex),
      explanations: qs.map((q) => q.explanation ?? ""),
    },
    { status: 201 }
  );
}
