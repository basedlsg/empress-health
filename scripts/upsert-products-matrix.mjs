// scripts/upsert-products-matrix.mjs
// Ingests data/products-matrix.json (parsed from SYMPTOMS_PRODUCTS_MATRIX_MARSHA_v2.xlsx)
// into the existing Pinecone "empress" index under a fresh namespace
// "products-matrix", using the hosted llama-text-embed-v2 model.
//
// Each product becomes one vector whose embedding input is built from
// product + brand + symptoms + categories + question texts + alternatives —
// so semantic queries by symptom, question, or category all rank it well.
// Metadata stays Pinecone-typed (string|number|bool|string[]) so the
// recommender can hydrate the full record without a follow-up lookup.
//
// Run:  node scripts/upsert-products-matrix.mjs

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC  = join(ROOT, "data", "products-matrix.json");

const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "empress";
const EMBED_MODEL         = process.env.PINECONE_EMBED_MODEL || "llama-text-embed-v2";
const EMBED_DIM           = Number(process.env.PINECONE_EMBED_DIM || 768);
const NAMESPACE           = "products-matrix";
const BATCH               = 50;

if (!PINECONE_API_KEY) { console.error("ERROR: PINECONE_API_KEY not set."); process.exit(1); }
if (!existsSync(SRC))   { console.error(`ERROR: ${SRC} not found. Run the xlsx parser first.`); process.exit(1); }

const records = JSON.parse(readFileSync(SRC, "utf8"));
console.log(`Loaded ${records.length} product records from ${SRC}`);

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pc.index(PINECONE_INDEX_NAME);

// Pinecone metadata accepts only string | number | boolean | string[].
function sanitiseMeta(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (v == null) continue;
    if (Array.isArray(v)) out[k] = v.map((x) => String(x));
    else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
    else out[k] = String(v);
  }
  return out;
}

// Build the text fed to the embedding model. Concatenates every field a
// retrieval query might match against. Stays under the ~2000-char soft limit.
function embeddingText(r) {
  const parts = [
    `Product: ${r.product || ""}`,
    r.brand     ? `Brand: ${r.brand}` : null,
    r.website   ? `Available at: ${r.website}` : null,
    r.symptoms?.length     ? `Addresses symptoms: ${r.symptoms.join(", ")}.` : null,
    r.categories?.length   ? `Categories: ${r.categories.join(", ")}.` : null,
    r.question_texts?.length ? `Assessment questions matched: ${r.question_texts.join(" / ")}` : null,
    r.empress_naturals_alternatives?.length ? `Empress Naturals alternatives: ${r.empress_naturals_alternatives.join(", ")}.` : null,
    r.thorne_alternatives?.length          ? `Thorne alternatives: ${r.thorne_alternatives.join(", ")}.` : null,
  ].filter(Boolean);
  return parts.join("\n").slice(0, 2000);
}

async function embedBatch(texts) {
  const result = await pc.inference.embed({
    model: EMBED_MODEL,
    inputs: texts,
    parameters: { input_type: "passage", truncate: "END", dimension: EMBED_DIM },
  });
  return result.data.map((d) => d.values);
}

// ── Embed + collect vectors ───────────────────────────────────────────────
const vectors = [];
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const texts = batch.map(embeddingText);
  console.log(`Embedding ${i + 1}-${Math.min(i + BATCH, records.length)} of ${records.length}…`);
  const values = await embedBatch(texts);
  for (let j = 0; j < batch.length; j++) {
    const r = batch[j];
    vectors.push({
      id: r.id,
      values: values[j],
      metadata: sanitiseMeta({
        product:       r.product,
        brand:         r.brand,
        website:       r.website,
        symptoms:      r.symptoms,
        categories:    r.categories,
        category_slugs: r.category_slugs,
        question_ids:  (r.question_ids || []).map(String),  // Pinecone arrays: string[] only
        question_texts: r.question_texts,
        empress_alts:  r.empress_naturals_alternatives,
        thorne_alts:   r.thorne_alternatives,
        source:        r.source,
        // Truncated readable content for the recommender to surface inline
        // without a second hop (mirrors how the clinical chunks store it):
        content:       embeddingText(r).slice(0, 1500),
      }),
    });
  }
}

// ── Upsert ────────────────────────────────────────────────────────────────
console.log(`\nUpserting ${vectors.length} vectors → namespace "${NAMESPACE}"…`);
const UPSERT_BATCH = 100;
for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
  await index.upsert({
    records: vectors.slice(i, i + UPSERT_BATCH).map((v) => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata,
    })),
    namespace: NAMESPACE,
  });
  process.stdout.write(".");
}
console.log(`\n✓ Upserted ${vectors.length} product vectors.\n`);

// ── Sanity probes — query by symptom + by question text ──────────────────
async function probe(label, query) {
  const embed = await pc.inference.embed({
    model: EMBED_MODEL,
    inputs: [query],
    parameters: { input_type: "query", truncate: "END", dimension: EMBED_DIM },
  });
  const ns = index.namespace(NAMESPACE);
  const result = await ns.query({
    vector: embed.data[0].values,
    topK: 3,
    includeMetadata: true,
  });
  console.log(`\n${label}: "${query}"`);
  for (const m of result.matches || []) {
    const md = m.metadata || {};
    console.log(`  ${m.score.toFixed(3)}  ${md.product} (${md.brand})  → Empress: ${(md.empress_alts || []).join(", ")}`);
  }
}

await probe("Symptom probe", "skin is significantly drier no matter what products I use");
await probe("Question probe", "Have hot flashes started disrupting your daily routine?");
await probe("Category probe", "musculoskeletal bone density joint pain");

console.log("\nDone.\n");
