// Add a source-labelled library to the existing index, preserving other namespaces.
// Successful batches are checkpointed locally so interrupted imports can resume.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config({ quiet: true });
const require = createRequire(import.meta.url);
const config = require('../lib/pinecone-config');
const file = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || 'artifacts/ask-empress-library/corpus.json');
const corpus = readFileSync(file, 'utf8');
const chunks = JSON.parse(corpus);
const checkpointFile = join(dirname(file), 'upsert-checkpoint.json');
const identity = createHash('sha256').update(corpus + JSON.stringify(config)).digest('hex');
if (!Array.isArray(chunks) || !chunks.length) throw new Error('Empty corpus');
if (config.askEmpressNamespace === config.namespace) throw new Error('Use a separate library namespace');
for (const c of chunks) {
  if (!c._id?.startsWith('empress-library-') || !c.content?.trim() || c.content.length > 2200 ||
      Buffer.byteLength(JSON.stringify({ ...c.metadata, content: c.content })) > 39000) {
    throw new Error(`Invalid passage: ${c._id}`);
  }
}
if (new Set(chunks.map(c => c._id)).size !== chunks.length) throw new Error('Duplicate IDs');
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ records: chunks.length, index: config.indexName, namespace: config.askEmpressNamespace,
    model: config.embedModel, dimension: config.embedDimension }));
  process.exit(0);
}
if (!process.env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY is required');
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY, maxRetries: 1,
  fetchApi: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(60000) }),
});
const description = await retry(() => pc.describeIndex(config.indexName));
if (description.dimension !== config.embedDimension || description.metric !== 'cosine' || !description.status.ready) {
  throw new Error('Existing index must be ready with matching dimensions and cosine metric');
}
const model = await retry(() => pc.inference.getModel(config.embedModel));
const batchSize = Math.min(model.maxBatchSize || 50, 50);
const index = pc.index(config.indexName);
const ns = index.namespace(config.askEmpressNamespace);
const before = await retry(() => index.describeIndexStats());
let checkpoint = { identity, completed: [], tokens: 0 };
if (existsSync(checkpointFile)) {
  const saved = JSON.parse(readFileSync(checkpointFile, 'utf8'));
  if (saved.identity === identity) checkpoint = saved;
}
const completed = new Set(checkpoint.completed);
async function remoteIds(partition = false) {
  const ids = new Set();
  const prefixes = partition ? [...'0123456789abcdef'].map(c => 'empress-library-' + c) : ['empress-library-'];
  let nextPrefix = 0;
  async function listWorker() {
    while (nextPrefix < prefixes.length) {
      const prefix = prefixes[nextPrefix++];
      let paginationToken;
      do {
        const page = await retry(() => ns.listPaginated({ prefix, limit: 100, paginationToken }));
        for (const vector of page.vectors || []) ids.add(vector.id);
        paginationToken = page.pagination?.next;
      } while (paginationToken);
    }
  }
  await Promise.all(Array.from({ length: partition ? 4 : 1 }, () => listWorker()));
  return ids;
}
// ID listing avoids downloading thousands of full vectors during resume checks.
if (completed.size) {
  const present = await remoteIds();
  for (const id of completed) if (!present.has(id)) completed.delete(id);
}
const pending = chunks.filter(c => !completed.has(c._id));
console.log(`Importing ${pending.length}/${chunks.length} passages to ${config.indexName}/${config.askEmpressNamespace}; ${completed.size} already present.`);
function pause(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function retry(operation) {
  for (let attempt = 0; ; attempt++) {
    try { return await operation(); }
    catch (error) {
      // Quota exhaustion needs operator attention, not repeated requests.
      if (attempt >= 5 || /quota|monthly|payment/i.test(error.message) ||
          !/429|rate.limit|too.many|timeout|503|502|504/i.test(error.message)) throw error;
      const wait = Math.min(60000, 5000 * 2 ** attempt);
      console.log(`Temporary import limit; retrying in ${wait / 1000}s.`);
      await pause(wait);
    }
  }
}
let nextBatch = 0;
async function worker() {
 while (nextBatch < pending.length) {
  const i = nextBatch;
  nextBatch += batchSize;
  const batch = pending.slice(i, i + batchSize);
  const embedded = await retry(() => pc.inference.embed({ model: config.embedModel,
    inputs: batch.map(c => c.content),
    parameters: { input_type: 'passage', truncate: 'NONE', dimension: config.embedDimension },
  }));
  if (embedded.data.length !== batch.length) throw new Error('Embedding count mismatch');
  const records = batch.map((c, j) => {
    const values = embedded.data[j].values;
    if (values?.length !== config.embedDimension || !values.every(Number.isFinite)) throw new Error('Invalid vector');
    return { id: c._id, values, metadata: { ...c.metadata, content: c.content } };
  });
  await retry(() => ns.upsert({ records }));
  for (const c of batch) completed.add(c._id);
  checkpoint = { identity, completed: [...completed], tokens: checkpoint.tokens + (embedded.usage?.totalTokens || 0) };
  writeFileSync(checkpointFile, JSON.stringify(checkpoint));
  console.log(`Indexed ${completed.size}/${chunks.length}; tokens ${checkpoint.tokens}`);
 }
}
// Bounded concurrency speeds up document imports; retry handles service throttles.
await Promise.all(Array.from({ length: 3 }, () => worker()));
// Verify all IDs and sample full metadata, allowing for eventual consistency.
let present;
for (let attempt = 0; attempt < 4; attempt++) {
  present = await remoteIds(true);
  if (chunks.every(c => present.has(c._id))) break;
  await pause(5000);
}
if (chunks.some(c => !present.has(c._id))) throw new Error('Verification found missing records; rerun to resume');
const samples = [chunks[0], chunks[Math.floor(chunks.length / 2)], chunks.at(-1)];
const fetched = await retry(() => ns.fetch({ ids: samples.map(c => c._id) }));
for (const c of samples) if (fetched.records?.[c._id]?.metadata?.content !== c.content) throw new Error('Metadata verification failed');
const after = await retry(() => index.describeIndexStats());
for (const [name, stats] of Object.entries(before.namespaces || {})) {
  if (name !== config.askEmpressNamespace && after.namespaces?.[name]?.recordCount !== stats.recordCount) {
    throw new Error(`Other namespace changed during import: ${name}`);
  }
}
console.log(JSON.stringify({ verified: chunks.length, tokens: checkpoint.tokens, namespaces: after.namespaces }, null, 2));
