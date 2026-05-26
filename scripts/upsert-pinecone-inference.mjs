// scripts/upsert-pinecone-inference.mjs
// Embeds the enriched seed chunks via Pinecone's Inference API and upserts
// them into a Pinecone serverless index. No OpenAI key required — Pinecone
// handles embedding with its hosted multilingual-e5-large model.
//
// Run: node scripts/upsert-pinecone-inference.mjs

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENRICHED = join(ROOT, "pinecone_data", "empress-120-symptom-biomarker-framework-records.enriched.json");

const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "empress";
// Reuse the existing 768-dim "empress" index via a dedicated namespace so we
// don't disturb any other data and don't burn one of the 5 serverless slots.
const EMBED_MODEL         = "llama-text-embed-v2";    // supports 384/512/768/1024/2048
const EMBED_DIM           = 768;
const NAMESPACE           = "clinical-framework";

if (!PINECONE_API_KEY) {
  console.error("ERROR: PINECONE_API_KEY not set.");
  process.exit(1);
}
if (!existsSync(ENRICHED)) {
  console.error(`ERROR: enriched seed not found: ${ENRICHED}`);
  console.error("Run 'npm run seed:enrich' first.");
  process.exit(1);
}

const chunks = JSON.parse(readFileSync(ENRICHED, "utf8"));
console.log(`Loaded ${chunks.length} enriched chunks.`);

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

// ─── Create the index if it doesn't exist ────────────────────────────────────
const existing = await pc.listIndexes();
const indexNames = (existing.indexes || []).map((i) => i.name);
if (!indexNames.includes(PINECONE_INDEX_NAME)) {
  console.log(`Creating Pinecone index "${PINECONE_INDEX_NAME}" (${EMBED_DIM}-dim, cosine)…`);
  await pc.createIndex({
    name: PINECONE_INDEX_NAME,
    dimension: EMBED_DIM,
    metric: "cosine",
    spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    waitUntilReady: true,
  });
  console.log("  ✓ index created");
} else {
  console.log(`Index "${PINECONE_INDEX_NAME}" already exists.`);
}

const index = pc.index(PINECONE_INDEX_NAME);

// ─── Sanitise metadata (Pinecone only accepts string/number/bool or arrays) ──
function sanitise(meta) {
  const out = {};
  for (const [k, v] of Object.entries(meta || {})) {
    if (Array.isArray(v)) {
      out[k] = v.map((x) => String(x));
    } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else if (v === null || v === undefined) {
      continue;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

// ─── Embed in batches via Pinecone Inference API (SDK v7 signature) ─────────
async function embedBatch(texts, inputType) {
  const result = await pc.inference.embed({
    model: EMBED_MODEL,
    inputs: texts,
    parameters: {
      input_type: inputType,
      truncate: "END",
      dimension: EMBED_DIM,
    },
  });
  return result.data.map((d) => d.values);
}

const BATCH = 50;
const records = [];

for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH);
  const texts = batch.map((c) => {
    // Compose embedding input: content + metadata signal (helps retrieval).
    const metaSignal = [
      ...(c.metadata?.clinical_topics || []),
      ...(c.metadata?.category_slugs || []),
      ...(c.metadata?.system_tags || []),
    ].join(" ");
    return (c.content || "").slice(0, 2000) + " " + metaSignal;
  });
  console.log(`Embedding batch ${i + 1}-${Math.min(i + BATCH, chunks.length)} of ${chunks.length}…`);
  const vectors = await embedBatch(texts, "passage");
  for (let j = 0; j < batch.length; j++) {
    const c = batch[j];
    records.push({
      id: c._id,
      values: vectors[j],
      metadata: {
        ...sanitise(c.metadata),
        content: (c.content || "").slice(0, 4000),
        doc_id: c.doc_id || "",
        chunk_index: String(c.chunk_index ?? ""),
      },
    });
  }
}

console.log(`Upserting ${records.length} records to namespace "${NAMESPACE}"…`);
const UPSERT_BATCH = 100;
for (let i = 0; i < records.length; i += UPSERT_BATCH) {
  await index.upsert({
    records: records.slice(i, i + UPSERT_BATCH),
    namespace: NAMESPACE,
  });
  process.stdout.write(".");
}
console.log("");
console.log(`  ✓ upserted ${records.length} records`);

// ─── Sanity-check: query for vasomotor symptoms ──────────────────────────────
const probe = await pc.inference.embed({
  model: EMBED_MODEL,
  inputs: ["severe hot flashes night sweats menopause"],
  parameters: { input_type: "query", truncate: "END", dimension: EMBED_DIM },
});
const result = await ns.query({
  vector: probe.data[0].values,
  topK: 3,
  includeMetadata: true,
});
console.log("\nSanity probe — top 3 for 'severe hot flashes night sweats menopause':");
for (const m of result.matches || []) {
  const slugs = m.metadata?.category_slugs;
  const slugStr = Array.isArray(slugs) ? slugs.join(",") : (slugs || "");
  console.log(`  ${m.score.toFixed(3)}  ${m.id}  [${slugStr}]`);
}
console.log("\nDone.");
