// scripts/upsert-menopause-directory.mjs
// Ingests data/menopause-directory.json (parsed from
// Menopause_Directory_with_ZIP.xlsx, sheet "Directory") into the existing
// Pinecone "empress" index under a fresh namespace "menopause-directory",
// using the hosted llama-text-embed-v2 model.
//
// Each provider becomes one vector whose embedding input is built from
// name + qualification + category + state + city/address — so semantic
// queries like "menopause specialist in California" or "nurse practitioner
// Texas" rank the right clinicians. Metadata stays Pinecone-typed
// (string|number|bool|string[]) so the UI can hydrate the full listing
// (phone, website, LinkedIn, ZIP) without a follow-up lookup.
//
// Run:  node scripts/upsert-menopause-directory.mjs

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC  = join(ROOT, "data", "menopause-directory.json");

const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "empress";
const EMBED_MODEL         = process.env.PINECONE_EMBED_MODEL || "llama-text-embed-v2";
const EMBED_DIM           = Number(process.env.PINECONE_EMBED_DIM || 768);
const NAMESPACE           = "menopause-directory";
const BATCH               = 50;

if (!PINECONE_API_KEY) { console.error("ERROR: PINECONE_API_KEY not set."); process.exit(1); }
if (!existsSync(SRC))   { console.error(`ERROR: ${SRC} not found. Run the xlsx parser first.`); process.exit(1); }

const records = JSON.parse(readFileSync(SRC, "utf8"));
console.log(`Loaded ${records.length} provider records from ${SRC}`);

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

// Build the text fed to the embedding model. Concatenates the fields a
// "find me a provider" query matches against. Stays well under the soft limit.
function embeddingText(r) {
  const parts = [
    `${r.name || ""}`,
    r.qualification ? `Qualification: ${r.qualification}` : (r.category ? `Category: ${r.category}` : null),
    r.category && r.qualification ? `Category: ${r.category}` : null,
    r.state   ? `State: ${r.state}` : null,
    r.address ? `Location: ${r.address}` : null,
    "Menopause provider.",
  ].filter(Boolean);
  return parts.join("\n").slice(0, 2000);
}

// Short human-readable summary stored in metadata so the UI can render a
// listing card inline without re-fetching the JSON.
function contentSummary(r) {
  const bits = [
    r.name,
    r.qualification || r.category,
    r.address || r.state,
  ].filter(Boolean);
  let s = bits.join(" — ");
  if (r.phone)   s += ` | ${r.phone}`;
  if (r.website) s += ` | ${r.website}`;
  return s.slice(0, 1500);
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
        name:          r.name,
        category:      r.category,
        qualification: r.qualification,
        state:         r.state,
        address:       r.address,
        phone:         r.phone,
        website:       r.website,
        linkedin:      r.linkedin,
        zip:           r.zip == null ? null : String(r.zip),
        content:       contentSummary(r),
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
console.log(`\n✓ Upserted ${vectors.length} provider vectors.\n`);

// ── Sanity probes ─────────────────────────────────────────────────────────
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
    console.log(`  ${m.score.toFixed(3)}  ${md.name}  [${md.state} · ${md.category}]`);
  }
}

await probe("Probe 1", "menopause specialist in California");
await probe("Probe 2", "nurse practitioner Texas");

console.log("\nDone.\n");
