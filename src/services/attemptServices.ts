
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