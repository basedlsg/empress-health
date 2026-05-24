/**
 * scripts/validate-catalog.mjs
 * Validates that all evidence_refs, category_slugs, domain_ids, and
 * urgent_questions entries across catalog files resolve to real corpus entries.
 *
 * Run: node scripts/validate-catalog.mjs
 * Wire: npm run validate:catalog
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, "..");

// ─── Load ground-truth sets ───────────────────────────────────────────────────

const SEED_FILE = path.join(ROOT, "pinecone_data",
  "empress-120-symptom-biomarker-framework-records.enriched.json");

let seed;
try {
  seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
} catch (err) {
  console.error(`FATAL: Cannot load seed file: ${err.message}`);
  process.exit(1);
}
const REAL_CHUNK_IDS = new Set(seed.map((c) => c._id));

// Canonical 10 category slugs from prds/assessmentQuestions.ts
const CANONICAL_SLUGS = new Set([
  "vasomotor-temperature",
  "sleep-architecture-cortisol",
  "cognitive-function-brain-health",
  "mood-anxiety-emotional-health",
  "metabolic-health-body-composition",
  "skin-hair-nails",
  "musculoskeletal-bone-health",
  "genitourinary-sexual-health",
  "cardiovascular-whole-body-energy",
  "lifestyle-gut-health-nutrition",
]);

// Valid domain IDs 1–10
const VALID_DOMAIN_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Clinical flag question numbers from prds/hisEngine.ts
const CLINICAL_FLAG_QS = new Set([2, 41, 43, 48, 57, 63, 82, 83, 84, 86, 93, 99, 104, 105, 107]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

let errors   = 0;
let warnings = 0;
let checks   = 0;

function fail(file, msg) {
  console.error(`  ERROR [${file}] ${msg}`);
  errors++;
}
function warn(file, msg) {
  console.warn(`  WARN  [${file}] ${msg}`);
  warnings++;
}
function ok(file, msg) {
  console.log(`  OK    [${file}] ${msg}`);
  checks++;
}

function validateEvidenceRefs(refs, context, filename) {
  if (!Array.isArray(refs)) return;
  for (const id of refs) {
    if (!REAL_CHUNK_IDS.has(id)) {
      fail(filename, `${context}: evidence_ref "${id}" not in enriched seed`);
    }
  }
}

function validateCategorySlugs(slugs, context, filename) {
  if (!Array.isArray(slugs)) return;
  for (const s of slugs) {
    if (!CANONICAL_SLUGS.has(s)) {
      fail(filename, `${context}: category_slug "${s}" not in canonical 10 slugs`);
    }
  }
}

function validateDomainIds(ids, context, filename) {
  if (!Array.isArray(ids)) return;
  for (const id of ids) {
    if (!VALID_DOMAIN_IDS.has(id)) {
      fail(filename, `${context}: domain_id ${id} not in 1–10`);
    }
  }
}

// ─── Validate product_catalog.json ───────────────────────────────────────────

console.log("\n=== product_catalog.json ===");
const CATALOG_FILE = path.join(ROOT, "data", "product_catalog.json");
try {
  const raw     = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf8"));
  const products = Array.isArray(raw) ? raw : (raw.products || []);

  if (products.length === 0) {
    fail("product_catalog.json", "No products found");
  } else {
    for (const p of products) {
      const ctx = `product "${p.id || p.name}"`;
      validateEvidenceRefs(p.evidence_refs, ctx, "product_catalog.json");
      validateCategorySlugs(p.category_slugs, ctx, "product_catalog.json");
      validateDomainIds(p.domain_ids, ctx, "product_catalog.json");
      // stage_relevance should be valid stages
      if (Array.isArray(p.stage_relevance)) {
        const validStages = new Set(["perimenopause", "menopause", "post_menopause", "all"]);
        for (const s of p.stage_relevance) {
          if (!validStages.has(s)) {
            warn("product_catalog.json", `${ctx}: stage_relevance "${s}" is not a known stage`);
          }
        }
      }
    }
    ok("product_catalog.json", `Checked ${products.length} products`);
  }
} catch (err) {
  fail("product_catalog.json", `Load error: ${err.message}`);
}

// ─── Validate clinician_taxonomy.json ────────────────────────────────────────

console.log("\n=== clinician_taxonomy.json ===");
const CLINICIANS_FILE = path.join(ROOT, "data", "clinician_taxonomy.json");
try {
  const raw       = JSON.parse(fs.readFileSync(CLINICIANS_FILE, "utf8"));
  const clinicians = Array.isArray(raw) ? raw : (raw.clinicians || []);

  if (clinicians.length === 0) {
    fail("clinician_taxonomy.json", "No clinicians found");
  } else {
    for (const c of clinicians) {
      const ctx = `clinician "${c.id}"`;
      validateEvidenceRefs(c.evidence_refs, ctx, "clinician_taxonomy.json");
      validateDomainIds(c.domain_ids, ctx, "clinician_taxonomy.json");

      // urgent_questions must all be in CLINICAL_FLAGS
      if (Array.isArray(c.urgent_questions)) {
        for (const q of c.urgent_questions) {
          if (!CLINICAL_FLAG_QS.has(Number(q))) {
            fail("clinician_taxonomy.json",
              `${ctx}: urgent_question ${q} not in CLINICAL_FLAGS`);
          }
        }
      }
    }
    ok("clinician_taxonomy.json", `Checked ${clinicians.length} clinicians`);
  }
} catch (err) {
  fail("clinician_taxonomy.json", `Load error: ${err.message}`);
}

// ─── Validate fallback_affirmations.json ─────────────────────────────────────

console.log("\n=== fallback_affirmations.json ===");
const FALLBACK_FILE = path.join(ROOT, "data", "fallback_affirmations.json");
try {
  const raw       = JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf8"));
  const fallbacks = Array.isArray(raw) ? raw : (raw.fallbacks || []);

  if (fallbacks.length === 0) {
    warn("fallback_affirmations.json", "No fallback affirmations found");
  } else {
    for (let i = 0; i < fallbacks.length; i++) {
      const aff = fallbacks[i];
      const ctx = `fallback[${i}]`;
      validateEvidenceRefs(aff.evidence_refs, ctx, "fallback_affirmations.json");
      if (aff.focus_domain && !CANONICAL_SLUGS.has(aff.focus_domain)) {
        fail("fallback_affirmations.json",
          `${ctx}: focus_domain "${aff.focus_domain}" not in canonical 10 slugs`);
      }
    }
    ok("fallback_affirmations.json", `Checked ${fallbacks.length} fallback affirmations`);
  }
} catch (err) {
  fail("fallback_affirmations.json", `Load error: ${err.message}`);
}

// ─── Validate enriched seed itself ────────────────────────────────────────────

console.log("\n=== enriched seed (self-consistency check) ===");
{
  let seedErrors = 0;
  for (const chunk of seed) {
    const ctx = `chunk "${chunk._id}"`;
    const m   = chunk.metadata || {};
    if (Array.isArray(m.category_slugs)) {
      for (const s of m.category_slugs) {
        if (!CANONICAL_SLUGS.has(s)) {
          fail("enriched-seed", `${ctx}: category_slug "${s}" not canonical`);
          seedErrors++;
        }
      }
    }
    if (Array.isArray(m.domain_ids)) {
      for (const id of m.domain_ids) {
        if (!VALID_DOMAIN_IDS.has(id)) {
          fail("enriched-seed", `${ctx}: domain_id ${id} out of range`);
          seedErrors++;
        }
      }
    }
  }
  if (seedErrors === 0) {
    ok("enriched-seed", `All ${seed.length} chunks have valid slugs and domain IDs`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log("\n" + "─".repeat(60));
if (errors === 0 && warnings === 0) {
  console.log(`OK — all ${checks} checks passed, 0 errors, 0 warnings`);
} else if (errors === 0) {
  console.log(`WARN — ${checks} checks passed, 0 errors, ${warnings} warnings`);
} else {
  console.error(`FAIL — ${errors} errors, ${warnings} warnings across ${checks + errors} checks`);
}

process.exit(errors > 0 ? 1 : 0);
