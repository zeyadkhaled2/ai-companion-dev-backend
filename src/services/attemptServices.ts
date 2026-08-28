
import { PrismaClient } from '@prisma/client';
import { evaluateAnswerWithAI } from './geminiService';

const prisma = new PrismaClient();

function parseAIEvaluation(rawText: string): { score: number; feedback: string } {
    // Defensive cleanup: strip markdown code fences if Gemini adds them despite instructions
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        const parsed = JSON.parse(cleaned);
        if (typeof parsed.score !== 'number' || typeof parsed.feedback !== 'string') {
            throw new Error('AI response missing expected fields');
        }
        return { score: parsed.score, feedback: parsed.feedback };
    } catch (err) {
        throw new Error('Failed to parse AI evaluation response');
    }
}



export async function submitAnswer(userId: string, questionId: string, userAnswer: string) {
    const question = await prisma.question.findUnique({ where: { id: questionId } })
    if (!question) {
        throw new Error("Question Doesn't Exist ")
    }
    const response = await evaluateAnswerWithAI(question.category, question.difficulty, question.content, userAnswer)

    const parsedResponse = parseAIEvaluation(response)
    const attempt = await prisma.attempt.create({
        data: {
            userId: userId,
            questionId: questionId,
            userAnswer: userAnswer,
            aiScore: parsedResponse.score,
            aiFeedback: parsedResponse.feedback
        }
    })
    return attempt;
}
export async function getUserAttempts(userId: string) {
    return prisma.attempt.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  export async function getUserStats(userId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { createdAt: 'asc' },
  });

  const totalAttempts = attempts.length;
  const averageScore = totalAttempts === 0
    ? 0
    : Math.round(attempts.reduce((sum, a) => sum + a.aiScore, 0) / totalAttempts);

  // group by category
  const byCategory: Record<string, { total: number; count: number }> = {};
  for (const attempt of attempts) {
    const cat = attempt.question.category;
    if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
    byCategory[cat].total += attempt.aiScore;
    byCategory[cat].count += 1;
  }
  const categoryAverages = Object.entries(byCategory).map(([category, data]) => ({
    category,
    averageScore: Math.round(data.total / data.count),
  }));

  const scoreTrend = attempts.map((a) => ({ score: a.aiScore, date: a.createdAt }));

  return { totalAttempts, averageScore, categoryAverages, scoreTrend };
}