import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { submitAnswerSchema } from '../types/attemptSchemas';
import { submitAnswer } from '../services/attemptServices';
import { getUserAttempts } from '../services/attemptServices';
import { getUserStats } from '../services/attemptServices';

export async function submitAnswerController(req: AuthRequest, res: Response) {
  const parseResult = submitAnswerSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: 'Invalid input', errors: parseResult.error.issues });
    return;
  }

  if (!req.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { questionId, userAnswer } = parseResult.data;

  try {
    const attempt = await submitAnswer(req.userId, questionId, userAnswer);
    res.status(201).json({ attempt });
  } catch (err) {
    if (err instanceof Error && err.message === "Question Doesn't Exist") {
      res.status(404).json({ message: 'Question not found' });
      return;
    }
    if (err instanceof Error && err.message === 'AI_RATE_LIMIT') {
      res.status(429).json({ message: 'AI is a bit busy right now — please try again in a moment.' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to evaluate answer' });
  }
}
export async function getAttemptsController(req: AuthRequest, res: Response) {
  if (!req.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const attempts = await getUserAttempts(req.userId);
  res.status(200).json({ attempts });
}
export async function getStatsController(req: AuthRequest, res: Response) {
  if (!req.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  const stats = await getUserStats(req.userId);
  res.status(200).json({ stats });
}