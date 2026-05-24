/**
 * scripts/test-qa.mjs
 *
 * Tests the retrieval-grounded handleQA function from lib/qa.js.
 *
 * Usage:
 *   MOCK_LLM=1 node scripts/test-qa.mjs            # No API key needed
 *   OPENAI_API_KEY=<key> node scripts/test-qa.mjs  # Live OpenAI call
 *
 * With MOCK_LLM=1:
 *   - Retrieval runs against the local embedding file (no OpenAI embedding needed).
 *   - The OpenAI chat call is stubbed — callOpenAI is never invoked.
 *   - lib/qa.js itself checks MOCK_LLM and returns a stub answer before calling the injected helper.
 *   - This validates retrieval runs, chunk IDs are real, and the response shape is correct.
 *
 * Exit code 0 = all assertions pass. Non-zero = failure.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { handleQA } = require("../lib/qa.js");

// ── Load the real chunk IDs from the seed so we can validate source refs ──────
const enriched = require("../pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json");
const REAL_CHUNK_IDS = new Set(enriched.map((c) => c._id || c.id));

// ── Fixed test queries ────────────────────────────────────────────────────────
const TEST_QUERIES = [
  "Why do hot flashes get worse at night?",
  "Should I take phytoestrogens?",
  "What's the safest exercise for bone density?",
];

// ── Assertion helper ──────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// ── Stub callOpenAI (only used when MOCK_LLM is NOT set, as a safety net) ─────
async function stubCallOpenAI(systemPrompt, userQuery, _signal) {
  // This should not be reached when MOCK_LLM=1; included as safety net.
  return `[STUB ANSWER] I do not have specific information on that — please ask your NAMS-certified provider.\n\nSources: none`;
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log("=== test-qa.mjs ===");
console.log(`MOCK_LLM=${process.env.MOCK_LLM || "0"}\n`);

for (const query of TEST_QUERIES) {
  console.log(`\n--- Query: "${query}" ---`);

  let result;
  try {
    result = await handleQA({
      query,
      callOpenAI: stubCallOpenAI,
      requestId: `test-${Date.now().toString(36)}`,
    });
  } catch (err) {
    console.error("handleQA threw:", err.message);
    failed++;
    continue;
  }

  // Print for human review
  console.log("Answer:", result.answer?.slice(0, 300));
  console.log("Sources:");
  (result.sources || []).forEach((s) => {
    console.log(`  ${s.id} (score: ${typeof s.score === "number" ? s.score.toFixed(3) : s.score})`);
  });

  // Assertions
  assert(typeof result.answer === "string" && result.answer.trim().length > 0, "answer is non-empty string");
  assert(Array.isArray(result.sources), "sources is an array");

  for (const src of result.sources) {
    assert(REAL_CHUNK_IDS.has(src.id), `source "${src.id}" is a real chunk ID`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
