/**
 * lib/retrieval.js — Empress Grounded Retrieval Module
 * CommonJS. Drop-in for all downstream LLM context injection.
 *
 * Two modes, same return shape:
 *   Pinecone mode  — PINECONE_API_KEY + PINECONE_INDEX_NAME set
 *   Local mode     — loads data/pinecone-embeddings.json into memory
 *
 * API:
 *   init()                    → Promise<void>  — call once at server start
 *   retrieve(opts)            → Promise<Chunk[]>
 *   retrieveContext(opts)     → Promise<{ context, citations }>
 *
 * retrieve opts:
 *   query         string  — natural-language query
 *   k             number  — top-k results (default 5)
 *   filter        object  — optional metadata filter
 *     domain_ids?         number[]   — restrict to these domains
 *     category_slugs?     string[]   — restrict to these slugs
 *     question_ids?       number[]   — restrict to chunks mentioning these Q#s
 *     stage?              string     — "perimenopause"|"menopause"|"post_menopause"
 *     clinical_topics?    string[]   — restrict to chunks with these topic tags
 *
 * Each returned chunk: { id, content, score, metadata, relaxed_filter? }
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────
const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "empress-clinical-framework";
const OPENAI_API_KEY      = process.env.OPENAI_API_KEY;

const DATA_FILE  = path.join(__dirname, "..", "data", "pinecone-embeddings.json");
const VOCAB_FILE = path.join(__dirname, "..", "data", "tfidf-vocab.json");

const MODE = (PINECONE_API_KEY && PINECONE_INDEX_NAME) ? "pinecone" : "local";

// Minimum confidence threshold — below this the match is noise
const MIN_SCORE_THRESHOLD = 0.10;

// ─── In-memory state (local mode) ────────────────────────────────────────────
let _localChunks    = null;   // [{ _id, content, metadata, embedding, embedding_model }]
let _embeddingModel = null;   // model name stored in embeddings file
let _vocab          = null;   // string[] sorted vocab (tfidf model)
let _vocabIndex     = null;   // Map<string, number>
let _idf            = null;   // Float64Array of idf weights
let _pineconeIndex  = null;
let _initialized    = false;

// ─── SYNONYM MAP — matches embed-pinecone-seed.mjs exactly ───────────────────
const SYNONYMS = {
  "gsm":              ["gsm", "genitourinary", "vaginal", "vulvar", "vulvovaginal"],
  "genitourinary":    ["gsm", "genitourinary", "vaginal"],
  "vaginal":          ["gsm", "genitourinary", "vaginal", "vulvovaginal"],
  "vulvar":           ["gsm", "vaginal", "vulvar", "vulvovaginal"],
  "dryness":          ["dryness", "atrophy", "atrophic"],
  "intercourse":      ["intercourse", "dyspareunia", "sexual", "coital"],
  "pain":             ["pain", "dyspareunia", "discomfort"],
  "dexa":             ["dexa", "bone density", "densitometry", "bmd"],
  "bone":             ["bone", "dexa", "osteoporosis", "fracture", "skeletal"],
  "fracture":         ["fracture", "fractures", "osteoporosis", "bone density", "dexa"],
  "osteoporosis":     ["osteoporosis", "osteopenia", "fracture", "dexa", "bone density"],
  "density":          ["density", "bmd", "dexa", "bone"],
  "hot":              ["hot", "vasomotor", "flush", "flashes"],
  "flashes":          ["flashes", "flash", "vasomotor", "hot flash", "night sweats"],
  "flash":            ["flash", "flashes", "vasomotor", "hot flash"],
  "vasomotor":        ["vasomotor", "hot flashes", "hot flash", "night sweats", "flush"],
  "night":            ["night", "nocturnal", "sweats", "vasomotor"],
  "sweats":           ["sweats", "vasomotor", "night sweats", "nocturnal"],
  "menopause":        ["menopause", "perimenopause", "climacteric"],
  "perimenopause":    ["perimenopause", "perimenopausal", "menopause"],
  "mood":             ["mood", "anxiety", "emotional", "depression", "psychological"],
  "anxiety":          ["anxiety", "anxious", "mood", "emotional", "psychological"],
  "depression":       ["depression", "depressed", "mood", "phq"],
  "brain":            ["brain", "cognitive", "cognition", "memory", "neurological", "bdnf"],
  "fog":              ["fog", "cognitive", "cognition", "memory", "brain fog", "bdnf"],
  "cognitive":        ["cognitive", "cognition", "brain", "memory", "fog", "bdnf"],
  "word":             ["word", "cognitive", "cognition", "brain fog", "memory"],
  "finding":          ["finding", "cognitive", "word finding", "memory", "brain fog"],
  "bdnf":             ["bdnf", "cognitive", "brain", "memory", "neuroplasticity"],
  "decline":          ["decline", "cognitive", "memory", "brain fog"],
  "insulin":          ["insulin", "metabolic", "blood sugar", "glucose", "berberine"],
  "visceral":         ["visceral", "fat", "adipose", "metabolic", "abdominal"],
  "panic":            ["panic", "anxiety", "anxious", "emotional", "mood"],
};

// ─── Tokeniser (mirrors embed-pinecone-seed.mjs) ──────────────────────────────
function _tokenise(text) {
  const norm = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = norm.split(" ").filter((w) => w.length > 1);
  const raw = new Set();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    raw.add(w);
    if (i + 1 < words.length) raw.add(w + " " + words[i + 1]);
  }

  const expanded = new Set(raw);
  for (const tok of raw) {
    const syns = SYNONYMS[tok];
    if (syns) for (const s of syns) expanded.add(s);
  }

  return [...expanded];
}

// ─── TF-IDF query vector (for local-tfidf-vocab-v2) ──────────────────────────
function _tfidfQueryVector(text) {
  if (!_vocabIndex || !_idf) return null;
  const tokens = _tokenise(text);
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

  const vec = new Float64Array(_vocabIndex.size);
  for (const [tok, count] of tf) {
    const idx = _vocabIndex.get(tok);
    if (idx === undefined) continue;
    vec[idx] = (count / tokens.length) * _idf[idx];
  }

  let sumSq = 0;
  for (const v of vec) sumSq += v * v;
  const mag = Math.sqrt(sumSq) || 1;
  return Array.from(vec).map((v) => v / mag);
}

// ─── OLD hashed n-gram fallback (backward compat for stored embeddings) ───────
const _crypto = require("crypto");
function _localHashedNgramEmbed(text, dim = 768) {
  const vec = new Float64Array(dim);
  const norm = text.toLowerCase().replace(/\s+/g, " ").trim();

  function addNgram(gram) {
    const hash = _crypto.createHash("sha256").update(gram).digest();
    const idx  = (hash[0] | (hash[1] << 8) | (hash[2] << 16)) % dim;
    const sign = (hash[3] & 1) ? 1 : -1;
    const mag  = (hash[4] + 1) / 256;
    vec[Math.abs(idx)] += sign * mag;
  }

  for (let i = 0; i < norm.length - 2; i++) addNgram("c3:" + norm.slice(i, i + 3));
  const words = norm.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 1) addNgram("w1:" + words[i]);
    if (i + 1 < words.length) addNgram("w2:" + words[i] + " " + words[i + 1]);
  }

  let sum = 0;
  for (const v of vec) sum += v * v;
  const mag2 = Math.sqrt(sum) || 1;
  return Array.from(vec).map((v) => v / mag2);
}

// ─── OpenAI single-text embedding ────────────────────────────────────────────
async function _openAIEmbed(text) {
  let fetch;
  try { fetch = globalThis.fetch; } catch (_) {}
  if (!fetch) {
    const mod = await import("node-fetch");
    fetch = mod.default;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let resp;
  try {
    resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      }),
    });
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI embedding error ${resp.status}: ${err}`);
  }
  const json = await resp.json();
  return json.data[0].embedding;
}

// ─── Embed a query using the stored embedding model ───────────────────────────
async function _embedQuery(text) {
  const model = _embeddingModel || "local-tfidf-vocab-v2";

  if (model === "openai-text-embedding-3-small" && OPENAI_API_KEY) {
    return await _openAIEmbed(text);
  }
  if (model === "local-tfidf-vocab-v2" && _vocabIndex) {
    return _tfidfQueryVector(text);
  }
  if (model === "local-hashed-ngram-v1") {
    return _localHashedNgramEmbed(text, 768);
  }
  // Unknown model — try tfidf if available, else hashed ngram
  if (_vocabIndex) return _tfidfQueryVector(text);
  return _localHashedNgramEmbed(text, 768);
}

// ─── Cosine similarity (dot product of L2-normalised vectors) ─────────────────
function _cosine(a, b) {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) dot += a[i] * b[i];
  return dot;
}

// ─── Metadata filter for local mode ──────────────────────────────────────────
function _matchesFilter(metadata, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.domain_ids && filter.domain_ids.length > 0) {
    const chunkDomains = new Set(metadata.domain_ids || []);
    if (!filter.domain_ids.some((d) => chunkDomains.has(d))) return false;
  }
  if (filter.category_slugs && filter.category_slugs.length > 0) {
    const chunkSlugs = new Set(metadata.category_slugs || []);
    if (!filter.category_slugs.some((s) => chunkSlugs.has(s))) return false;
  }
  if (filter.question_ids && filter.question_ids.length > 0) {
    const chunkQs = new Set(metadata.question_ids || []);
    if (!filter.question_ids.some((q) => chunkQs.has(q))) return false;
  }
  if (filter.stage) {
    const chunkStages = new Set(metadata.stage_relevance || []);
    if (!chunkStages.has(filter.stage)) return false;
  }
  if (filter.clinical_topics && filter.clinical_topics.length > 0) {
    const chunkTopics = new Set(metadata.clinical_topics || []);
    if (!filter.clinical_topics.some((t) => chunkTopics.has(t))) return false;
  }
  return true;
}

// ─── Pinecone filter translation ─────────────────────────────────────────────
function _toPineconeFilter(filter) {
  if (!filter || Object.keys(filter).length === 0) return undefined;
  const conditions = [];
  if (filter.domain_ids?.length)
    conditions.push({ domain_ids: { $in: filter.domain_ids } });
  if (filter.category_slugs?.length)
    conditions.push({ category_slugs: { $in: filter.category_slugs } });
  if (filter.question_ids?.length)
    conditions.push({ question_ids: { $in: filter.question_ids } });
  if (filter.stage)
    conditions.push({ stage_relevance: { $in: [filter.stage] } });
  if (filter.clinical_topics?.length)
    conditions.push({ clinical_topics: { $in: filter.clinical_topics } });
  if (conditions.length === 0) return undefined;
  return conditions.length === 1 ? conditions[0] : { $and: conditions };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * init() — Load embeddings into memory (local mode) or connect to Pinecone.
 * Idempotent: safe to call multiple times.
 */
async function init() {
  if (_initialized) return;

  if (MODE === "pinecone") {
    const { Pinecone } = await import("@pinecone-database/pinecone");
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    _pineconeIndex = pc.index(PINECONE_INDEX_NAME);
    console.log(`[retrieval] Pinecone mode: index="${PINECONE_INDEX_NAME}"`);
  } else {
    if (!fs.existsSync(DATA_FILE)) {
      throw new Error(
        `[retrieval] Local embedding file not found: ${DATA_FILE}\n` +
        "Run 'npm run seed:enrich && npm run seed:embed' first."
      );
    }
    _localChunks = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(_localChunks) || _localChunks.length === 0) {
      throw new Error("[retrieval] Local embedding file is empty or malformed.");
    }
    _embeddingModel = _localChunks[0]?.embedding_model || "local-hashed-ngram-v1";

    // Model mismatch check — local-tfidf-vocab-v2 requires the vocab file
    if (_embeddingModel === "local-tfidf-vocab-v2") {
      if (!fs.existsSync(VOCAB_FILE)) {
        throw new Error(
          `[retrieval] Embedding model is "${_embeddingModel}" but vocab file not found: ${VOCAB_FILE}\n` +
          "Run 'npm run seed:embed -- --force' to regenerate."
        );
      }
      const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, "utf8"));
      _vocab      = vocabData.vocab;
      _vocabIndex = new Map(_vocab.map((t, i) => [t, i]));
      _idf        = new Float64Array(vocabData.idf);
      console.log(`[retrieval] TF-IDF vocab loaded: ${_vocab.length} tokens`);
    } else if (_embeddingModel !== "local-hashed-ngram-v1" &&
               _embeddingModel !== "openai-text-embedding-3-small") {
      console.warn(
        `[retrieval] Unknown stored embedding model "${_embeddingModel}". ` +
        "Queries will fall back to hashed n-gram. Run 'npm run seed:embed -- --force' to fix."
      );
    }

    console.log(
      `[retrieval] Local mode: ${_localChunks.length} chunks loaded, ` +
      `model="${_embeddingModel}"`
    );
  }

  _initialized = true;
}

/**
 * retrieve({ query, k, filter }) → Promise<Array<{ id, content, score, metadata, relaxed_filter? }>>
 *
 * If filter eliminates all candidates, falls through to unfiltered scoring
 * and annotates each result with relaxed_filter: true.
 */
async function retrieve({ query, k = 5, filter = {} } = {}) {
  // Guard: empty query
  if (!query || typeof query !== "string" || !query.trim()) {
    return [];
  }

  // Auto-init if not yet initialised
  if (!_initialized) await init();

  if (MODE === "pinecone") {
    let vector;
    if (OPENAI_API_KEY) {
      vector = await _openAIEmbed(query);
    } else {
      vector = _localHashedNgramEmbed(query, 768);
    }

    const pcFilter = _toPineconeFilter(filter);
    const queryOpts = {
      vector,
      topK: k,
      includeMetadata: true,
      includeValues: false,
    };
    if (pcFilter) queryOpts.filter = pcFilter;

    const result = await _pineconeIndex.query(queryOpts);
    return (result.matches || []).map((m) => ({
      id:       m.id,
      content:  m.metadata?.content || "",
      score:    m.score,
      metadata: m.metadata || {},
    }));
  }

  // ── Local mode ──────────────────────────────────────────────────────────────
  const queryVec = await _embedQuery(query);
  if (!queryVec) {
    console.warn("[retrieval] Could not compute query vector — returning empty.");
    return [];
  }

  // Prefilter BEFORE scoring (mirrors Pinecone server-side filter)
  let candidates = _localChunks;
  let relaxed = false;

  const hasFilter = filter && Object.keys(filter).length > 0;
  if (hasFilter) {
    const filtered = _localChunks.filter((c) => _matchesFilter(c.metadata, filter));
    if (filtered.length > 0) {
      candidates = filtered;
    } else {
      // Filter eliminated everything — fall through unfiltered
      relaxed = true;
      console.warn("[retrieval] Filter eliminated all candidates — relaxing filter.");
    }
  }

  // Score
  const scored = candidates.map((c) => ({
    id:             c._id,
    content:        c.content,
    score:          _cosine(queryVec, c.embedding),
    metadata:       c.metadata,
    ...(relaxed ? { relaxed_filter: true } : {}),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Strip evidence_refs that don't exist in the corpus (they come from metadata)
  // — actually evidence_refs live in catalog/affirmations, not chunks themselves.
  // Just return the top-k.
  return scored.slice(0, k);
}

/**
 * retrieveContext({ query, k, filter, maxChars, minScore })
 * → Promise<{ context: string, citations: [{ id, score }] }>
 *
 * minScore: skip chunks below this threshold (default MIN_SCORE_THRESHOLD)
 */
async function retrieveContext({
  query, k = 5, filter = {}, maxChars = 4000, minScore = MIN_SCORE_THRESHOLD
} = {}) {
  const chunks = await retrieve({ query, k, filter });

  const citationLines = [];
  let totalChars = 0;
  const contextParts = [];

  for (const chunk of chunks) {
    // Skip low-confidence results — they are noise, not evidence
    if (chunk.score < minScore) continue;

    const header = `[${chunk.id}] (score: ${chunk.score.toFixed(3)})`;
    const body   = chunk.content.replace(/\n+/g, " ").trim();
    const block  = `${header}\n${body}`;

    if (totalChars + block.length > maxChars && contextParts.length > 0) break;
    contextParts.push(block);
    totalChars += block.length;
    citationLines.push({ id: chunk.id, score: chunk.score });
  }

  const context = contextParts.join("\n\n---\n\n");
  return { context, citations: citationLines };
}

module.exports = { init, retrieve, retrieveContext, MODE, MIN_SCORE_THRESHOLD };
