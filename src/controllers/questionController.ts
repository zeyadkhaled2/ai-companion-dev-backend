import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateQuestionSchema } from '../types/questionSchemas';
import { getOrGenerateQuestion } from '../services/questionService';

export async function generateQuestion(req: AuthRequest, res: Response) {
  const parseResult = generateQuestionSchema.safeParse(req.body);
  try {
    if (!parseResult.success) {
      res.status(400).json({ message: 'Invalid category or difficulty', errors: parseResult.error.issues });
      return;
    }

    const { category, difficulty } = parseResult.data;
    const question = await getOrGenerateQuestion(category, difficulty);


    res.status(200).json({ question });
  } catch (err) {
    if (err instanceof Error && err.message === 'AI_RATE_LIMIT') {
      res.status(429).json({ message: 'AI is a bit busy right now — please try again in a moment.' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}