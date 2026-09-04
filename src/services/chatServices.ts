import { PrismaClient } from '@prisma/client';
import { chatWithAI } from './geminiService';

const prisma = new PrismaClient();

export async function sendMessage(userId: string, conversationId: string | null, userMessage: string) {
  let conversation;

  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new Error('Conversation not found');
  } else {
    conversation = await prisma.conversation.create({
      data: { userId },
      include: { messages: true },
    });
  }

  // TODO 1: save the user's new message to the DB
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'user',
      content: userMessage,
    },
  });

  // TODO 2: build the full history array to send to Gemini
  const history = [
    ...conversation.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  // TODO 3: call chatWithAI with that history
  const replyText = await chatWithAI(history);

  // TODO 4: save the AI's reply to the DB
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: 'assistant',
      content: replyText,
    },
  });

  // TODO 5: return the result
  return { conversationId: conversation.id, reply: replyText };
}