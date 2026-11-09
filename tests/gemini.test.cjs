const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

test('Gemini answer evaluation forwards quota failures to the 429 handler', async () => {
  const source = readFileSync(
    join(__dirname, '../src/integrations/gemini/gemini.service.ts'),
    'utf8',
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    process: { env: { GEMINI_API_KEY: 'unit-test-key' } },
    require: () => ({
      GoogleGenAI: class {
        models = {
          generateContent: async () => {
            throw Object.assign(new Error('quota'), { status: 429 });
          },
        };
      },
    }),
  });
  await assert.rejects(
    exports.evaluateAnswerWithAI('React', 'Easy', 'Question', 'Answer'),
    /AI_RATE_LIMIT/,
  );
});
