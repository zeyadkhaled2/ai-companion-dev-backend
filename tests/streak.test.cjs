const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadService(prisma) {
  const source = readFileSync(join(__dirname, '../src/modules/streak/streak.service.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: () => ({ prisma }) });
  return exports;
}

test('check-ins count one day per account, span UTC midnight, and retain the best after a gap', async () => {
  const rows = new Map();
  const { recordLoginDay } = loadService({
    loginDay: {
      async createMany({ data, skipDuplicates }) {
        assert.equal(skipDuplicates, true);
        for (const row of data) rows.set(`${row.userId}:${row.day.toISOString()}`, row);
      },
      async findMany({ where }) {
        return [...rows.values()]
          .filter((row) => row.userId === where.userId && row.day <= where.day.lte)
          .sort((a, b) => a.day - b.day);
      },
    },
  });
  const check = async (user, time, current, best) => {
    const streak = await recordLoginDay(user, new Date(time));
    assert.equal(streak.current, current);
    assert.equal(streak.best, best);
  };
  await check('a', '2026-11-08T00:00:00Z', 1, 1);
  await check('a', '2026-11-08T23:59:59Z', 1, 1);
  assert.equal(rows.size, 1);
  await check('a', '2026-11-09T00:00:00Z', 2, 2);
  await check('b', '2026-11-09T00:00:00Z', 1, 1);
  await check('a', '2026-11-11T00:00:00Z', 1, 2);
});
