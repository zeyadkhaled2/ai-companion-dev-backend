import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { generateQuestionSchema } from '../types/questionSchemas';
import { getOrGenerateQuestion } from '../services/questionService';

export async function generateQuestion(req: AuthRequest, res: Response) {
  const parseResult = generateQuestionSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: 'Invalid category or difficulty', errors: parseResult.error.issues });
    return;
  }

  const { category, difficulty } = parseResult.data;
  const question = await getOrGenerateQuestion(category, difficulty);

  res.status(200).json({ question });
}