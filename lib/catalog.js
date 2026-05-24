/**
 * lib/catalog.js — Empress Curated Product & Clinician Catalog
 * CommonJS. No hallucination: every recommendation comes from
 * data/product_catalog.json or data/clinician_taxonomy.json.
 *
 * Exports:
 *   getProductsForUser({ priorityCategories, userContext, k })
 *   getClinicianForUser({ urgentItemFlags, priorityDomainIds, stage })
 *   getAllProducts()
 *   getAllClinicians()
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ─── Lazy-load catalog files ─────────────────────────────────────────────────
let _products   = null;
let _clinicians = null;

function _loadProducts() {
  if (!_products) {
    const p = path.join(__dirname, "..", "data", "product_catalog.json");
    _products = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return _products;
}

function _loadClinicians() {
  if (!_clinicians) {
    const p = path.join(__dirname, "..", "data", "clinician_taxonomy.json");
    _clinicians = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  return _clinicians;
}

// ─── Urgent question → clinician map ─────────────────────────────────────────
// Keys are question numbers (as numbers). Values are clinician IDs.
const URGENT_Q_TO_CLINICIAN = {
  // Cardiovascular
  99:  "cardiologist",
  104: "cardiologist",
  105: "cardiologist",
  // Mental health
  41:  "mental_health_professional",
  43:  "mental_health_professional",
  48:  "mental_health_professional",
  // Genitourinary / pelvic floor
  86:  "pelvic_floor_pt",
  // Premature ovarian insufficiency
  2:   "endocrinologist",
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * getAllProducts() → Array of all catalog products.
 */
function getAllProducts() {
  return _loadProducts().slice();
}

/**
 * getAllClinicians() → Array of all clinician taxonomy entries.
 */
function getAllClinicians() {
  return _loadClinicians().slice();
}

/**
 * getProductsForUser({ priorityCategories, userContext, k })
 *
 * priorityCategories  string[]  — lowest-scoring category slugs (user's pain points)
 * userContext         object    — { stage, mhtActive, age, urgent_flags }
 * k                  number    — max results (default 5)
 *
 * Returns: Array<ProductEntry & { match_reason: string, retrieval_score: number }>
 */
async function getProductsForUser({ priorityCategories = [], userContext = {}, k = 5 } = {}) {
  const catalog = _loadProducts();
  const { stage } = userContext;

  // 1. Filter by category overlap
  const prioritySet = new Set(priorityCategories);
  let candidates = catalog.filter((p) => {
    return p.category_slugs.some((slug) => prioritySet.has(slug));
  });

  // 2. Filter by stage relevance (if stage provided)
  if (stage) {
    const withStage = candidates.filter(
      (p) => Array.isArray(p.stage_relevance) && p.stage_relevance.includes(stage)
    );
    // Fall back to all candidates if stage filter empties the list
    if (withStage.length > 0) {
      candidates = withStage;
    }
  }

  // 3. Rank: primary = matching category count (desc), secondary = retrieval score
  // Build retrieval scores lazily — attempt retrieval but degrade gracefully
  let retrieval;
  try {
    retrieval = require("./retrieval");
  } catch (_e) {
    retrieval = null;
  }

  const scored = await Promise.all(
    candidates.map(async (p) => {
      const matchCount = p.category_slugs.filter((s) => prioritySet.has(s)).length;

      let retrievalScore = 0;
      if (retrieval) {
        try {
          const query = [
            priorityCategories.join(" "),
            ...(p.clinical_topics || [])
          ].join(" ");
          const results = await retrieval.retrieve({ query, k: 1, filter: {} });
          retrievalScore = results[0]?.score || 0;
        } catch (_err) {
          // Non-fatal — retrieval unavailable, score stays 0
        }
      }

      return { ...p, match_reason: p.blurb, retrieval_score: retrievalScore, _matchCount: matchCount };
    })
  );

  scored.sort((a, b) => {
    if (b._matchCount !== a._matchCount) return b._matchCount - a._matchCount;
    return b.retrieval_score - a.retrieval_score;
  });

  // Strip internal sort key before returning
  return scored.slice(0, k).map(({ _matchCount, ...rest }) => rest);
}

/**
 * getClinicianForUser({ urgentItemFlags, priorityDomainIds, stage })
 *
 * urgentItemFlags   Array<number | {question:number}>  — urgent flag question numbers
 * priorityDomainIds number[]                           — highest-priority domain IDs
 * stage             string                             — "perimenopause"|"menopause"|"post_menopause"
 *
 * Returns: ClinicianEntry | null
 */
async function getClinicianForUser({ urgentItemFlags = [], priorityDomainIds = [], stage } = {}) {
  const taxonomy = _loadClinicians();
  const byId = Object.fromEntries(taxonomy.map((c) => [c.id, c]));

  // Normalise urgent flags to plain question numbers
  const urgentNums = urgentItemFlags
    .map((f) => (typeof f === "object" && f !== null ? f.question : Number(f)))
    .filter((n) => !isNaN(n));

  // 1. URGENT wins
  for (const q of urgentNums) {
    const clinicianId = URGENT_Q_TO_CLINICIAN[q];
    if (clinicianId && byId[clinicianId]) {
      return byId[clinicianId];
    }
  }

  // 2. Best domain overlap
  if (priorityDomainIds.length > 0) {
    const prioritySet = new Set(priorityDomainIds);
    let bestClinician = null;
    let bestOverlap   = -1;

    for (const clinician of taxonomy) {
      const overlap = (clinician.domain_ids || []).filter((d) => prioritySet.has(d)).length;
      if (overlap > bestOverlap) {
        bestOverlap   = overlap;
        bestClinician = clinician;
      }
    }

    if (bestClinician && bestOverlap > 0) {
      return bestClinician;
    }
  }

  // 3. Default fallback — NAMS-Certified Menopause Practitioner
  return byId["nams_certified_mp"] || taxonomy[0] || null;
}

module.exports = {
  getProductsForUser,
  getClinicianForUser,
  getAllProducts,
  getAllClinicians,
};
