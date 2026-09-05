import { db } from "@/db";
import { tests, questions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Get a test with its questions (correct answers hidden for students). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [test] = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
  if (!test) return apiError("Không tìm thấy bài thi", 404);

  const qs = await db
    .select({
      id: questions.id,
      content: questions.content,
      options: questions.options,
      orderIndex: questions.orderIndex,
    })
    .from(questions)
    .where(eq(questions.testId, id))
    .orderBy(asc(questions.orderIndex));

  return Response.json({
    test: {
      id: test.id,
      title: test.title,
      level: test.level,
      description: test.description,
      durationMinutes: test.durationMinutes,
    },
    questions: qs,
    totalQuestions: qs.length,
  });
}
