const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function service({ failAI = false } = {}) {
  const writes = [],
    lookups = [];
  let aiCalls = 0;
  const conversation = { id: 'conversation-a', userId: 'owner-a', messages: [] };
  const prisma = {
    conversation: {
      findFirst: async (query) => {
        lookups.push(query);
        return query.where.userId === conversation.userId ? conversation : null;
      },
      create: async ({ data }) => ({ ...conversation, userId: data.userId }),
    },
    $transaction: async (callback) =>
      callback({
        message: {
          create: async ({ data }) => {
            writes.push(data);
            return data;
          },
        },
      }),
  };
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, '../src/modules/chat/chat.service.ts'), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require(id) {
      if (id === '../../shared/database/prisma') return { prisma };
      if (id === '../../integrations/gemini/gemini.service')
        return {
          chatWithAI: async () => {
            aiCalls++;
            if (failAI) throw Error('AI unavailable');
            return 'Reply';
          },
        };
      throw Error(id);
    },
  });
  return { api: exports, writes, lookups, aiCalls: () => aiCalls };
}

test('foreign conversation is rejected before any AI call or message write', async () => {
  const s = service();
  await assert.rejects(
    s.api.sendMessage('owner-b', 'conversation-a', 'Hello'),
    /Conversation not found/,
  );
  assert.equal(s.aiCalls(), 0);
  assert.equal(s.writes.length, 0);
  assert.equal(s.lookups[0].where.id, 'conversation-a');
});

test('restoration is scoped to the authenticated user and orders messages', async () => {
  const s = service();
  assert.equal(await s.api.getLatestConversation('owner-b'), null);
  assert.equal(s.lookups[0].where.userId, 'owner-b');
  assert.equal(s.lookups[0].select.messages.orderBy.createdAt, 'asc');
  assert.equal(s.lookups[0].orderBy.createdAt, 'desc');
});

test('successful turn writes user then assistant together', async () => {
  const s = service();
  const response = await s.api.sendMessage('owner-a', 'conversation-a', 'Hello');
  assert.equal(response.reply, 'Reply');
  assert.deepEqual(
    s.writes.map((m) => m.role),
    ['user', 'assistant'],
  );
  assert.equal(s.writes[0].content, 'Hello');
  assert.ok(s.writes[1].createdAt > s.writes[0].createdAt);
});

test('failed AI turn is not saved as delivered chat history', async () => {
  const s = service({ failAI: true });
  await assert.rejects(s.api.sendMessage('owner-a', 'conversation-a', 'Hello'), /AI unavailable/);
  assert.equal(s.writes.length, 0);
});
