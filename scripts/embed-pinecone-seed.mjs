/**
 * embed-pinecone-seed.mjs
 * Generates embeddings for each enriched chunk.
 *
 * Primary: OpenAI text-embedding-3-small (1536-dim) — requires OPENAI_API_KEY
 * Fallback: Deterministic TF-IDF vocab embedding (local-tfidf-vocab-v2) — zero deps
 *   Builds a sorted vocabulary from the corpus, computes TF-IDF vectors,
 *   and boosts metadata tokens (clinical_topics, category_slugs) at 3x weight.
 *   Synonym expansion is applied before tokenisation.
 *   This replaces the old "local-hashed-ngram-v1" which suffered hash collisions
 *   on clinically-critical short tokens (GSM, DEXA, fracture).
 *
 * Run: node scripts/embed-pinecone-seed.mjs [--force]
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SRC     = join(ROOT, "pinecone_data", "empress-120-symptom-biomarker-framework-records.enriched.json");
const DEST    = join(ROOT, "data", "pinecone-embeddings.json");
const VOCAB_DEST = join(ROOT, "data", "tfidf-vocab.json");
const FORCE   = process.argv.includes("--force");

// ─── Validate input ───────────────────────────────────────────────────────────
if (!existsSync(SRC)) {
  console.error(`ERROR: Enriched seed not found at ${SRC}`);
  console.error("Run 'npm run seed:enrich' first.");
  process.exit(1);
}

const chunks = JSON.parse(readFileSync(SRC, "utf8"));

// ─── Determine embedding mode ─────────────────────────────────────────────────
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY;
const USE_OPENAI        = Boolean(OPENAI_API_KEY);
const EMBEDDING_MODEL   = USE_OPENAI ? "openai-text-embedding-3-small" : "local-tfidf-vocab-v2";
const EMBEDDING_DIM     = USE_OPENAI ? 1536 : null; // vocab-dim determined at runtime

// ─── Cache check ──────────────────────────────────────────────────────────────
if (!FORCE && existsSync(DEST)) {
  const existing = JSON.parse(readFileSync(DEST, "utf8"));
  if (existing.length > 0 && existing[0].embedding_model === EMBEDDING_MODEL) {
    console.log(`Cache hit: ${DEST} already contains ${existing.length} chunks with model '${EMBEDDING_MODEL}'.`);
    console.log("Use --force to re-embed.");
    process.exit(0);
  }
  console.log(`Cache mismatch (stored model="${existing[0]?.embedding_model}", target="${EMBEDDING_MODEL}"). Re-embedding...`);
}

console.log(`\nEmbedding mode: ${EMBEDDING_MODEL}`);
console.log(`Chunks to embed: ${chunks.length}\n`);

// ─── SYNONYM MAP — domain-specific expansions ────────────────────────────────
// Applied at tokenise time so queries using any synonym hit the same tokens.
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
  "menopause":        ["menopause", "menopause", "perimenopause", "climacteric"],
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

// ─── Tokeniser ────────────────────────────────────────────────────────────────
// Strips punctuation, lowercases, returns word unigrams and bigrams,
// then expands synonyms.
function tokenise(text) {
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

  // Synonym expansion
  const expanded = new Set(raw);
  for (const tok of raw) {
    const syns = SYNONYMS[tok];
    if (syns) for (const s of syns) expanded.add(s);
  }

  return [...expanded];
}

// ─── Build vocabulary from corpus ────────────────────────────────────────────
function buildVocab(allTexts) {
  const df = new Map(); // token → document frequency
  const N  = allTexts.length;

  for (const text of allTexts) {
    const toks = new Set(tokenise(text));
    for (const t of toks) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }

  // Sort vocab for stable, deterministic dimension assignment
  const vocab = [...df.keys()].sort();
  const vocabIndex = new Map(vocab.map((t, i) => [t, i]));
  // IDF: log((N + 1) / (df + 1)) + 1  (sklearn smooth variant)
  const idf = new Float64Array(vocab.length);
  for (let i = 0; i < vocab.length; i++) {
    idf[i] = Math.log((N + 1) / ((df.get(vocab[i]) || 0) + 1)) + 1;
  }

  return { vocab, vocabIndex, idf, N };
}

// ─── TF-IDF vector for a single text ─────────────────────────────────────────
function tfidfVector(text, vocabIndex, idf, boostTokens = [], boostWeight = 3.0) {
  const tokens = tokenise(text);
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

  const vec = new Float64Array(vocabIndex.size);
  for (const [tok, count] of tf) {
    const idx = vocabIndex.get(tok);
    if (idx === undefined) continue;
    vec[idx] = (count / tokens.length) * idf[idx];
  }

  // Boost metadata tokens
  for (const tok of boostTokens) {
    const normTok = tok.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
    const idx = vocabIndex.get(normTok);
    if (idx !== undefined) {
      vec[idx] *= boostWeight;
    }
    // Also boost synonyms of metadata tokens
    const syns = SYNONYMS[normTok];
    if (syns) {
      for (const s of syns) {
        const sidx = vocabIndex.get(s);
        if (sidx !== undefined) vec[sidx] = Math.max(vec[sidx], idf[sidx] * boostWeight);
      }
    }
  }

  // L2 normalise
  let sumSq = 0;
  for (const v of vec) sumSq += v * v;
  const mag = Math.sqrt(sumSq) || 1;
  const norm = Array.from(vec).map((v) => v / mag);

  return norm;
}

// ─── Build summary text for embedding ────────────────────────────────────────
function buildSummary(chunk) {
  const m = chunk.metadata || {};
  const firstPart = chunk.content.slice(0, 200).replace(/\n+/g, " ");
  const parts = [
    firstPart,
    m.category_slugs?.length ? `Categories: ${m.category_slugs.join(", ")}` : "",
    m.system_tags?.length    ? `Systems: ${m.system_tags.join(", ")}` : "",
    m.clinical_topics?.length ? `Topics: ${m.clinical_topics.slice(0, 8).join(", ")}` : "",
    m.stage_relevance?.length ? `Stage: ${m.stage_relevance.join(", ")}` : "",
  ].filter(Boolean);
  return parts.join(". ");
}

// ─── Collect boost tokens per chunk from metadata ────────────────────────────
function chunkBoostTokens(chunk) {
  const m = chunk.metadata || {};
  return [
    ...(m.clinical_topics || []),
    ...(m.category_slugs || []),
    ...(m.system_tags || []),
  ];
}

// ─── OpenAI batch embedding ───────────────────────────────────────────────────
async function openAIEmbed(texts) {
  const BATCH = 64;
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);

    // 30-second AbortController timeout per batch
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
          input: batch,
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
    for (const item of json.data) {
      results.push(item.embedding);
    }
    console.log(`  Embedded batch ${Math.floor(i/BATCH)+1}/${Math.ceil(texts.length/BATCH)}`);
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const summaries = chunks.map(buildSummary);
  let embeddings;
  let finalModel = EMBEDDING_MODEL;
  let vocabMeta = null;

  if (USE_OPENAI) {
    console.log("Using OpenAI text-embedding-3-small...");
    embeddings = await openAIEmbed(summaries);
  } else {
    console.log("Building TF-IDF vocabulary from corpus...");

    // Build vocab from all summaries (the text we embed)
    const { vocab, vocabIndex, idf } = buildVocab(summaries);
    console.log(`  Vocabulary size: ${vocab.length} tokens`);

    embeddings = chunks.map((chunk, i) => {
      const boostToks = chunkBoostTokens(chunk);
      return tfidfVector(summaries[i], vocabIndex, idf, boostToks, 3.0);
    });

    // Save vocab for query-time use
    vocabMeta = {
      model: finalModel,
      vocab,
      idf: Array.from(idf),
    };
    writeFileSync(VOCAB_DEST, JSON.stringify(vocabMeta), "utf8");
    console.log(`  Vocab saved to: ${VOCAB_DEST}`);
  }

  const output = chunks.map((chunk, i) => ({
    _id:            chunk._id,
    content:        chunk.content,
    metadata:       chunk.metadata || {},
    summary:        summaries[i],
    embedding:      embeddings[i],
    embedding_model: finalModel,
  }));

  writeFileSync(DEST, JSON.stringify(output, null, 2), "utf8");
  console.log(`\nWrote ${output.length} embeddings to: ${DEST}`);
  console.log(`Model:     ${finalModel}`);
  console.log(`Dimension: ${output[0].embedding.length}`);

  // Sanity check: self-dot ≈ 1.0
  const v0 = output[0].embedding;
  const selfDot = v0.reduce((s, x) => s + x * x, 0);
  console.log(`Self-dot of first vector: ${selfDot.toFixed(6)} (expect ≈1.0)`);
}

main().catch((err) => {
  console.error("Embedding failed:", err.message);
  process.exit(1);
});
