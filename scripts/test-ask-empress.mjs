import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { test, after } from 'node:test';

// No live Pinecone calls or model credentials are needed by this suite.
process.env.PINECONE_API_KEY = '';
process.env.MOCK_LLM = '0';
process.env.ASK_EMPRESS_PROVIDER = 'openai-compatible';
process.env.ASK_EMPRESS_MODEL = 'test-open-model';
process.env.ASK_EMPRESS_API_KEY = 'test-server-key';
const require = createRequire(import.meta.url);
const { callAskEmpressModel } = require('../lib/ask-empress-model');
const { handleQA } = require('../lib/qa');
const { mergeChunks, sourceDetails } = require('../lib/retrieval');

let captured;
let mode = 'answer';
const server = createServer(async (req, res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  captured = { path: req.url, authorization: req.headers.authorization, body: JSON.parse(body) };
  res.setHeader('Content-Type', 'application/json');
  if (mode === 'unavailable') {
    res.writeHead(503);
    res.end('{"error":"Unavailable"}');
  } else if (mode === 'empty') {
    res.end('{"choices":[]}');
  } else {
    res.end(JSON.stringify({ choices: [{ message: { content: ' An answer from the configured model. ' } }] }));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
process.env.ASK_EMPRESS_BASE_URL = `http://127.0.0.1:${server.address().port}/v1/`;
after(() => new Promise(resolve => server.close(resolve)));

test('open model receives evidence, question and configured authentication', async () => {
  const result = await callAskEmpressModel('Clinical evidence', 'Question');
  assert.equal(result, 'An answer from the configured model.');
  assert.equal(captured.path, '/v1/chat/completions');
  assert.equal(captured.authorization, 'Bearer test-server-key');
  assert.equal(captured.body.model, 'test-open-model');
  assert.deepEqual(captured.body.messages, [
    { role: 'system', content: 'Clinical evidence' },
    { role: 'user', content: 'Question' },
  ]);
});

test('provider outages and empty responses are failures, not medical answers', async () => {
  mode = 'unavailable';
  await assert.rejects(callAskEmpressModel('Evidence', 'Question'), /HTTP 503/);
  mode = 'empty';
  await assert.rejects(callAskEmpressModel('Evidence', 'Question'), /empty answer/);
  mode = 'answer';
});

test('cancelled model requests honour the upstream timeout', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(callAskEmpressModel('Evidence', 'Question', controller.signal), { name: 'AbortError' });
});

test('grounded answers carry actual passages and provider failures are distinguishable', async () => {
  let modelReceivedEvidence = false;
  const result = await handleQA({
    query: 'What causes hot flashes and night sweats?',
    callOpenAI: async (system, question) => {
      modelReceivedEvidence = system.includes('CLINICAL EVIDENCE') && system.includes('empress-120-symptom-biomarker-framework-chunk-');
      assert.equal(question, 'What causes hot flashes and night sweats?');
      return 'Grounded answer.';
    },
  });
  assert.equal(modelReceivedEvidence, true);
  assert.equal(result.status, 'answered');
  assert.ok(result.sources.length > 0);
  assert.ok(result.sources.every(source => source.snippet.length > 0));
  const failed = await handleQA({
    query: 'What causes hot flashes and night sweats?',
    callOpenAI: async () => { throw new Error('Model offline'); },
  });
  assert.equal(failed.status, 'unavailable');
  assert.deepEqual(failed.sources, []);
  assert.match(failed.answer, /temporarily unavailable/);
});

test('unrelated questions do not call the answer model', async () => {
  const result = await handleQA({
    query: 'zzzzzzzzzzzz',
    callOpenAI: async () => { assert.fail('Model should not run without evidence'); },
  });
  assert.equal(result.status, 'no_evidence');
  assert.deepEqual(result.sources, []);
});

test('namespace merge keeps score order while removing duplicate passages and diversifying files', () => {
  const chunk = (id, score, file, content = id) => ({ id, score, content, metadata: { source_file: file } });
  const result = mergeChunks([
    chunk('a', .9, 'book.xlsx'), chunk('duplicate', .85, 'copy.xlsx', 'a'),
    chunk('b', .8, 'book.xlsx'), chunk('c', .7, 'book.xlsx'),
    chunk('d', .6, 'paper.pdf'), chunk('framework', .5, ''),
    chunk('empty', .99, '', ''), chunk('bad', NaN, ''),
  ], 5);
  assert.deepEqual(result.map(c => c.id), ['a', 'b', 'd', 'framework']);
});

test('source provenance survives while unsafe links are omitted', () => {
  const metadata = { source_title: 'Hot flashes', source_file: 'research.xlsx',
    source_type: 'research_summary', source_locator: 'Q&A, row 4', source_url: 'https://pubmed.ncbi.nlm.nih.gov/123/' };
  assert.deepEqual(sourceDetails({ metadata }), { title: 'Hot flashes', sourceFile: 'research.xlsx',
    sourceType: 'research_summary', locator: 'Q&A, row 4', url: metadata.source_url });
  for (const source_url of ['javascript:alert(1)', 'https://user:password@example.com', 'file:///tmp/file']) {
    assert.equal(sourceDetails({ metadata: { ...metadata, source_url } }).url, '');
  }
  assert.equal(sourceDetails({}).title, 'Empress clinical framework');
});
