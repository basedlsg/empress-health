/**
 * upsert-pinecone.mjs
 * Upserts empress-120 embeddings into a Pinecone index.
 *
 * Requires:
 *   PINECONE_API_KEY      — your Pinecone API key
 *   PINECONE_INDEX_NAME   — index name (default: empress-clinical-framework)
 *
 * Run: node scripts/upsert-pinecone.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const DATA_FILE = join(ROOT, "data", "pinecone-embeddings.json");

const PINECONE_API_KEY    = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "empress-clinical-framework";

if (!PINECONE_API_KEY) {
  console.log("Pinecone upsert: ensure PINECONE_API_KEY is set.");
  console.log("  export PINECONE_API_KEY=your_key_here");
  console.log("  export PINECONE_INDEX_NAME=empress-clinical-framework  # optional");
  process.exit(0);
}

if (!existsSync(DATA_FILE)) {
  console.error(`ERROR: Embedding file not found at ${DATA_FILE}`);
  console.error("Run 'npm run seed:embed' first.");
  process.exit(1);
}

const chunks = JSON.parse(readFileSync(DATA_FILE, "utf8"));
console.log(`Loaded ${chunks.length} chunks from ${DATA_FILE}`);

// Pinecone metadata values must be strings, numbers, booleans, or arrays thereof
function sanitiseMetadata(meta) {
  const out = {};
  for (const [k, v] of Object.entries(meta)) {
    if (Array.isArray(v)) {
      // Pinecone supports array of strings/numbers
      out[k] = v.map((x) => String(x));
    } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

try {
  const { Pinecone } = await import("@pinecone-database/pinecone");
  const pc    = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX_NAME);

  const BATCH = 100;
  let upserted = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vectors = batch.map((c) => ({
      id:       c._id,
      values:   c.embedding,
      metadata: {
        ...sanitiseMetadata(c.metadata),
        content: c.content.slice(0, 1000), // Pinecone metadata limit
      },
    }));

    await index.upsert(vectors);
    upserted += vectors.length;
    console.log(`  Upserted batch ${Math.floor(i/BATCH)+1}: ${upserted}/${chunks.length} vectors`);
  }

  console.log(`\nUpsert complete. ${upserted} vectors in index "${PINECONE_INDEX_NAME}".`);
} catch (err) {
  if (err.code === "ERR_MODULE_NOT_FOUND" || err.message?.includes("Cannot find package")) {
    console.error("ERROR: @pinecone-database/pinecone not installed.");
    console.error("Run: npm install @pinecone-database/pinecone");
  } else {
    console.error("Upsert error:", err.message);
  }
  process.exit(1);
}
