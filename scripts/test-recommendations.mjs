/**
 * scripts/test-recommendations.mjs
 *
 * Smoke test for the curated catalog recommendation system.
 * Run: node scripts/test-recommendations.mjs
 *
 * Assertions:
 *   1. Returned products all exist in data/product_catalog.json
 *   2. Returned clinician is in data/clinician_taxonomy.json
 *   3. Urgent Q99 → Cardiologist routing works
 *   4. Urgent Q41 → Mental Health Professional routing works
 */

import { createRequire } from "module";
import { readFileSync }  from "fs";
import { fileURLToPath } from "url";
import { dirname, join }  from "path";

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = dirname(__filename);
const projectRoot = join(__dirname, "..");

const require = createRequire(import.meta.url);
const catalog = require(join(projectRoot, "lib", "catalog.js"));

// ─── Load catalog for ID validation ──────────────────────────────────────────
const CATALOG_RAW   = JSON.parse(readFileSync(join(projectRoot, "data", "product_catalog.json"),  "utf8"));
const TAXONOMY_RAW  = JSON.parse(readFileSync(join(projectRoot, "data", "clinician_taxonomy.json"), "utf8"));
const PRODUCT_IDS   = new Set(CATALOG_RAW.map((p) => p.id));
const CLINICIAN_IDS = new Set(TAXONOMY_RAW.map((c) => c.id));

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

// ─── Test 1: getProductsForUser — realistic perimenopause profile ─────────────
console.log("\n=== Test 1: getProductsForUser (vasomotor + sleep + mood, perimenopause) ===");
const products = await catalog.getProductsForUser({
  priorityCategories: [
    "vasomotor-temperature",
    "sleep-architecture-cortisol",
    "mood-anxiety-emotional-health",
  ],
  userContext: {
    stage:      "perimenopause",
    mhtActive:  false,
    age:        47,
    urgent_flags: [],
  },
  k: 5,
});

assert(products.length > 0, "Returns at least 1 product");
assert(products.length <= 5, "Returns at most 5 products");

for (const p of products) {
  assert(
    PRODUCT_IDS.has(p.product_id || p.id),
    `Product "${p.product_name || p.name}" exists in catalog (id: ${p.product_id || p.id})`
  );
  assert(
    typeof (p.reason || p.match_reason || p.blurb) === "string",
    `Product "${p.product_name || p.name}" has a reason string`
  );
}

console.log("\nProducts returned:");
for (const p of products) {
  console.log(`  - ${p.product_name || p.name} [${p.price_tier}] — retrieval_score: ${(p.retrieval_score || 0).toFixed(4)}`);
}

// ─── Test 2: getClinicianForUser — no urgent flags → domain overlap ───────────
console.log("\n=== Test 2: getClinicianForUser (no urgent flags, domain [1,2,4]) ===");
const clinician1 = await catalog.getClinicianForUser({
  urgentItemFlags:  [],
  priorityDomainIds: [1, 2, 4],
  stage:            "perimenopause",
});

assert(clinician1 !== null, "Returns a clinician");
assert(CLINICIAN_IDS.has(clinician1.id), `Clinician "${clinician1.id}" exists in taxonomy`);
console.log(`  Clinician: ${clinician1.label} (${clinician1.id})`);

// ─── Test 3: Urgent Q99 → Cardiologist ────────────────────────────────────────
console.log("\n=== Test 3: Urgent Q99 → Cardiologist ===");
const clinician99 = await catalog.getClinicianForUser({
  urgentItemFlags:   [{ question: 99 }],
  priorityDomainIds: [1, 2, 4],
  stage:             "perimenopause",
});

assert(clinician99 !== null, "Returns a clinician for Q99");
assert(clinician99.id === "cardiologist", `Q99 maps to cardiologist (got: ${clinician99?.id})`);
assert(CLINICIAN_IDS.has(clinician99.id), `Cardiologist exists in taxonomy`);
console.log(`  Clinician: ${clinician99.label} (${clinician99.id})`);

// ─── Test 4: Urgent Q41 → Mental Health Professional ─────────────────────────
console.log("\n=== Test 4: Urgent Q41 → Mental Health Professional ===");
const clinician41 = await catalog.getClinicianForUser({
  urgentItemFlags:   [41],          // plain number form
  priorityDomainIds: [4],
  stage:             "menopause",
});

assert(clinician41 !== null, "Returns a clinician for Q41");
assert(clinician41.id === "mental_health_professional", `Q41 maps to mental_health_professional (got: ${clinician41?.id})`);
console.log(`  Clinician: ${clinician41.label} (${clinician41.id})`);

// ─── Test 5: All evidence_refs in catalog are real chunk IDs ─────────────────
console.log("\n=== Test 5: All product evidence_refs are real chunk IDs ===");
const VALID_CHUNK_IDS = new Set(
  Array.from({ length: 25 }, (_, i) =>
    `empress-120-symptom-biomarker-framework-chunk-${String(i).padStart(3, "0")}`
  )
);

let badRefCount = 0;
for (const prod of CATALOG_RAW) {
  for (const ref of (prod.evidence_refs || [])) {
    if (!VALID_CHUNK_IDS.has(ref)) {
      console.error(`  BAD REF in ${prod.id}: "${ref}"`);
      badRefCount++;
    }
  }
}
assert(badRefCount === 0, `No invented chunk IDs in product catalog (found ${badRefCount} bad refs)`);

// ─── Test 6: Stage filtering ──────────────────────────────────────────────────
console.log("\n=== Test 6: Stage filtering — vitex only for perimenopause ===");
const vitexPeri = await catalog.getProductsForUser({
  priorityCategories: ["mood-anxiety-emotional-health", "sleep-architecture-cortisol"],
  userContext: { stage: "post_menopause", mhtActive: false, age: 58 },
  k: 10,
});
const hasVitexPostMeno = vitexPeri.some((p) => (p.id || p.product_id) === "prod_vitex_chaste_tree");
assert(!hasVitexPostMeno, "Vitex (perimenopause-only) not returned for post_menopause user");

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All assertions passed.");
}
