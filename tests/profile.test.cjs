const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
function controller(user) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/modules/auth/auth.controller.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    Buffer,
    require(id) {
      if (id === '../../shared/database/prisma') return { prisma: { user } };
      return {};
    },
  });
  return exports;
}
function response() {
  return {
    code: 200,
    status(c) {
      this.code = c;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
test('profile photos reject remote URLs, malformed data, wrong formats and oversized payloads', () => {
  const { validPhoto } = controller({});
  for (const value of [
    undefined,
    42,
    'https://example.com/photo.jpg',
    'data:image/png;base64,/9j/',
    'data:image/jpeg;base64,YWJj',
    'data:image/jpeg;base64,' + 'A'.repeat(410001),
  ])
    assert.equal(validPhoto(value), false);
  assert.equal(validPhoto(null), true);
  assert.equal(validPhoto('data:image/jpeg;base64,/9j/2Q=='), true);
});
test('photo updates use authenticated identity and return only public profile fields', async () => {
  let query;
  const { updateProfilePhoto } = controller({
    update: async (args) => {
      query = args;
      return { id: 'owner', photo: null };
    },
  });
  const res = response();
  await updateProfilePhoto({ userId: 'owner', body: { userId: 'other', photo: null } }, res);
  assert.equal(query.where.id, 'owner');
  assert.equal(query.data.photo, null);
  assert.equal(query.select.password, undefined);
  assert.equal(res.code, 200);
});
test('unauthenticated and invalid photo requests never write to database', async () => {
  let writes = 0;
  const { updateProfilePhoto } = controller({ update: async () => writes++ });
  const unauth = response();
  await updateProfilePhoto({ body: { photo: null } }, unauth);
  assert.equal(unauth.code, 401);
  const invalid = response();
  await updateProfilePhoto({ userId: 'owner', body: { photo: 'bad' } }, invalid);
  assert.equal(invalid.code, 400);
  assert.equal(writes, 0);
});
