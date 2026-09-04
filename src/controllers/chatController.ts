import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendMessageSchema } from '../types/chatSchemas';
import { sendMessage } from '../services/chatServices';

export async function sendMessageController(req: AuthRequest, res: Response) {
  const parseResult = sendMessageSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ message: 'Invalid input', errors: parseResult.error.issues });
    return;
  }

  if (!req.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { conversationId, message } = parseResult.data;

  try {
    const result = await sendMessage(req.userId, conversationId ?? null, message);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'AI_RATE_LIMIT') {
      res.status(429).json({ message: 'AI is a bit busy right now — please try again in a moment.' });
      return;
    }
    if (err instanceof Error && err.message === 'Conversation not found') {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
}