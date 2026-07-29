import { PrismaClient, Category, Difficulty } from '@prisma/client';
import { generateQuestionWithAI } from './geminiService';

const prisma = new PrismaClient();

export async function getOrGenerateQuestion(category: Category, difficulty: Difficulty) {
  const existingQuestions = await prisma.question.findMany({
    where: { category, difficulty },
  });

  const BANK_THRESHOLD = 5;
  const shouldGenerateNew =
    existingQuestions.length < BANK_THRESHOLD || Math.random() < 0.3;

  if (shouldGenerateNew) {
    const content = await generateQuestionWithAI(category, difficulty);
    const newQuestion = await prisma.question.create({
      data: { category, difficulty, content },
    });
    return newQuestion;
  } else {
    const randomIndex = Math.floor(Math.random() * existingQuestions.length);
    return existingQuestions[randomIndex];
  }
}