import { z } from 'zod';

export const generateQuestionSchema = z.object({
  category: z.enum(['React', 'Node', 'JavaScript', 'HR', 'SQL']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

export type GenerateQuestionInput = z.infer<typeof generateQuestionSchema>;