/**
 * scripts/test-affirmations.mjs
 *
 * Tests the grounded generateAffirmations function from lib/affirmations.js.
 *
 * Usage:
 *   MOCK_LLM=1 node scripts/test-affirmations.mjs     # No API key needed — mocks LLM call
 *   GROQ_API_KEY=<key> node scripts/test-affirmations.mjs   # Live Groq call
 *
 * With MOCK_LLM=1:
 *   - Retrieval still runs against the local embedding file (no API key needed).
 *   - The LLM call is replaced with a deterministic stub that returns valid-shaped JSON.
 *   - This exercises the validation logic (chunk ID checks, focus_domain checks) fully.
 *
 * Exit code 0 = all assertions pass. Non-zero = failure.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { generateAffirmations } = require("../lib/affirmations.js");

// ── Load the real chunk IDs from the seed so we can validate refs ─────────────
const enriched = require("../pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json");
const REAL_CHUNK_IDS = new Set(enriched.map((c) => c._id || c.id));

// ── Test user profile ─────────────────────────────────────────────────────────
const testProfile = {
  firstName: "Test",
  age: 46,
  stage: "perimenopause",
  priorityCategorySlugs: [
    "vasomotor-temperature",
    "sleep-architecture-cortisol",
    "mood-anxiety-emotional-health",
  ],
  topConcernDomainIds: [1, 2, 4],
  mhtActive: false,
  health_goal: "better sleep and less anxiety",
  symptoms: "hot flashes, insomnia, irritability",
  approaches: "lifestyle, nutrition",
  dietary_restrictions: "none",
  stress_level: "high",
};

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

// ── Run ───────────────────────────────────────────────────────────────────────
console.log("=== test-affirmations.mjs ===");
console.log(`MOCK_LLM=${process.env.MOCK_LLM || "0"}\n`);

const prioritySet = new Set(testProfile.priorityCategorySlugs);

let result;
try {
  result = await generateAffirmations(testProfile, "test-run");
} catch (err) {
  console.error("generateAffirmations threw:", err.message);
  process.exit(1);
}

// ── Print for human review ────────────────────────────────────────────────────
console.log("--- Affirmations ---");
(result.affirmations || []).forEach((a, i) => {
  console.log(`\n[${i + 1}] ${a.text}`);
  console.log(`    focus_domain : ${a.focus_domain}`);
  console.log(`    evidence_refs: ${(a.evidence_refs || []).join(", ")}`);
});

console.log("\n--- Citations ---");
(result.citations || []).forEach((c) => {
  console.log(`  ${c.id} (score: ${typeof c.score === "number" ? c.score.toFixed(3) : c.score})`);
});

// ── Assertions ────────────────────────────────────────────────────────────────
console.log("\n--- Assertions ---");

assert(Array.isArray(result.affirmations), "result.affirmations is an array");
assert(result.affirmations.length >= 3, `affirmations.length >= 3 (got ${result.affirmations.length})`);
assert(Array.isArray(result.legacyStrings), "result.legacyStrings is an array (backward compat)");
assert(result.legacyStrings.length === result.affirmations.length, "legacyStrings length matches affirmations length");

for (let i = 0; i < result.affirmations.length; i++) {
  const aff = result.affirmations[i];
  assert(typeof aff.text === "string" && aff.text.trim().length > 0, `affirmation[${i}].text is non-empty string`);
  assert(Array.isArray(aff.evidence_refs) && aff.evidence_refs.length >= 1, `affirmation[${i}].evidence_refs has >= 1 entry`);

  const badRefs = (aff.evidence_refs || []).filter((r) => !REAL_CHUNK_IDS.has(r));
  assert(badRefs.length === 0, `affirmation[${i}]: all evidence_refs are real chunk IDs (bad: ${badRefs.join(", ") || "none"})`);

  assert(prioritySet.has(aff.focus_domain), `affirmation[${i}]: focus_domain "${aff.focus_domain}" is in input priorities`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
