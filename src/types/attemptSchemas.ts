import { z } from 'zod';

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string().min(1, 'Answer cannot be empty'),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;