import { prisma } from '../../shared/database/prisma';
import { chatWithAI } from '../../integrations/gemini/gemini.service';

export async function getLatestConversation(userId: string) {
  return prisma.conversation.findFirst({
    where: { userId, messages: { some: {} } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true } },
    },
  });
}

export async function sendMessage(
  userId: string,
  conversationId: string | null,
  userMessage: string,
) {
  let conversation;

  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new Error('Conversation not found');
  } else {
    conversation = await prisma.conversation.create({
      data: { userId },
      include: { messages: true },
    });
  }

  // Do not persist a failed turn as a successfully sent message.
  const history = [
    ...conversation.messages.map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const replyText = await chatWithAI(history);

  const sentAt = Date.now();
  await prisma.$transaction(async (tx) => {
    // PostgreSQL now() is constant within a transaction; keep turn order explicit.
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
        createdAt: new Date(sentAt),
      },
    });
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: replyText,
        createdAt: new Date(sentAt + 1),
      },
    });
  });

  return { conversationId: conversation.id, reply: replyText };
}
