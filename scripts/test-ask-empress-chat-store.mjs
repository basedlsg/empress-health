import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { createChatStore } = require('../lib/ask-empress-chat-store');

test('account histories persist separately and removing consent clears only that account', async () => {
  const rows = new Map();
  const calls = [];
  const pool = { query: async (sql, params = []) => {
    calls.push({ sql, params });
    if (sql.startsWith('INSERT')) rows.set(params[0], JSON.parse(params[1]));
    if (sql.startsWith('DELETE')) rows.delete(params[0]);
    if (sql.startsWith('SELECT')) return { rows: rows.has(params[0]) ? [{ exchanges: rows.get(params[0]) }] : [] };
    return { rows: [] };
  } };
  const store = createChatStore(() => pool);
  assert.deepEqual(await store.read(11), { remember: false, history: [] });
  await store.write(11, true, [{ question: 'What causes night sweats?', answer: 'An educational answer.' }]);
  await store.write(22, true, [{ question: 'What causes skin changes?', answer: 'Another answer.' }]);
  const reopened = createChatStore(() => pool);
  assert.equal((await reopened.read(11)).history[0].question, 'What causes night sweats?');
  assert.equal((await reopened.read(22)).history[0].question, 'What causes skin changes?');
  await reopened.write(11, false, []);
  assert.deepEqual(await store.read(11), { remember: false, history: [] });
  assert.equal((await store.read(22)).remember, true);
  assert.ok(calls.filter(call => call.sql.startsWith('SELECT')).every(call => call.sql.includes("updated_at > NOW() - INTERVAL '30 days'")));
  assert.ok(calls.filter(call => !call.sql.startsWith('CREATE')).every(call => [11, 22].includes(call.params[0])));
});

test('storage bounds untrusted history and fails clearly if the database is unavailable', async () => {
  let saved;
  const store = createChatStore(() => ({ query: async (sql, params) => {
    if (sql.startsWith('INSERT')) saved = JSON.parse(params[1]);
    return { rows: [] };
  } }));
  await store.write(11, true, Array.from({ length: 30 }, () => ({ question: 'q'.repeat(1000), answer: 'a'.repeat(3000) })));
  assert.ok(saved.length <= 8);
  assert.ok(saved.every(entry => entry.question.length <= 800 && entry.answer.length <= 1800));
  assert.ok(saved.reduce((sum, entry) => sum + entry.question.length + entry.answer.length, 0) <= 6000);
  await assert.rejects(createChatStore(() => null).read(11), /database unavailable/);
});
