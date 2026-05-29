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

// ─────────────────────────────────────────────────────────────────────────────
// MARSHA PRODUCT MATRIX (data/products-matrix.json)
//
// 100 curated third-party products tagged with up to 3 assessment-question IDs
// each, plus per-record Empress Naturals + Thorne alternatives. Two lookups:
//
//   getMatrixProductsByQuestions(questionIds, k)
//     — fast in-memory lookup keyed on the user's high-scoring question IDs.
//       Returns the most-matched products (each row carries Empress + Thorne
//       alts so the report can render them inline).
//
//   getMatrixProductsBySemantic({ query, k })
//     — semantic Pinecone search against the "products-matrix" namespace.
//       Useful when the user's signal is a free-text symptom rather than a
//       specific question ID (e.g. the free 20-Q flow's symptom answers).
// ─────────────────────────────────────────────────────────────────────────────

let _matrix       = null;
let _matrixByQ    = null;   // Map<number, MatrixRecord[]>

function _loadMatrix() {
  if (!_matrix) {
    const p = path.join(__dirname, "..", "data", "products-matrix.json");
    if (!fs.existsSync(p)) { _matrix = []; _matrixByQ = new Map(); return _matrix; }
    _matrix = JSON.parse(fs.readFileSync(p, "utf8"));
    _matrixByQ = new Map();
    for (const r of _matrix) {
      for (const q of (r.question_ids || [])) {
        const list = _matrixByQ.get(q) || [];
        list.push(r);
        _matrixByQ.set(q, list);
      }
    }
  }
  return _matrix;
}

function getMatrixProductsByQuestions(questionIds, k = 5) {
  _loadMatrix();
  if (!Array.isArray(questionIds) || questionIds.length === 0) return [];

  // Score each product by the number of priority question matches; ties
  // broken by the position of the FIRST match in the input (early = higher
  // priority for the user).
  const seen = new Map(); // id → { record, hits, firstPos }
  questionIds.forEach((q, pos) => {
    const qn = Number(q);
    const rows = _matrixByQ.get(qn) || [];
    for (const r of rows) {
      const existing = seen.get(r.id);
      if (existing) existing.hits += 1;
      else seen.set(r.id, { record: r, hits: 1, firstPos: pos });
    }
  });

  return [...seen.values()]
    .sort((a, b) => (b.hits - a.hits) || (a.firstPos - b.firstPos))
    .slice(0, k)
    .map(({ record, hits, firstPos }) => ({
      ...record,
      match_hits: hits,
      first_question_id: questionIds[firstPos],
    }));
}

// Semantic Pinecone path against the "products-matrix" namespace.
// (lib/retrieval.js is pinned to the clinical-framework namespace, so we
// keep a tiny Pinecone client local to this lookup instead of bending that
// module.) Returns hydrated MatrixRecord objects with a `score` field.
let _pineconeClient = null;
let _pineconeNs     = null;
async function _ensurePineconeNs() {
  if (_pineconeNs) return _pineconeNs;
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) return null;
  const { Pinecone } = require("@pinecone-database/pinecone");
  _pineconeClient = _pineconeClient || new Pinecone({ apiKey });
  const indexName = process.env.PINECONE_INDEX_NAME || "empress";
  _pineconeNs = _pineconeClient.index(indexName).namespace("products-matrix");
  return _pineconeNs;
}

async function getMatrixProductsBySemantic({ query, k = 5 } = {}) {
  if (!query || typeof query !== "string" || !query.trim()) return [];
  const ns = await _ensurePineconeNs();
  if (!ns) return [];
  try {
    const embedModel = process.env.PINECONE_EMBED_MODEL || "llama-text-embed-v2";
    const embedDim   = Number(process.env.PINECONE_EMBED_DIM || 768);
    const embed = await _pineconeClient.inference.embed({
      model: embedModel,
      inputs: [query],
      parameters: { input_type: "query", truncate: "END", dimension: embedDim },
    });
    const result = await ns.query({
      vector: embed.data[0].values,
      topK: k,
      includeMetadata: true,
    });
    // Re-hydrate with the in-memory record (more fields than Pinecone metadata).
    _loadMatrix();
    const byId = new Map(_matrix.map((r) => [r.id, r]));
    return (result.matches || [])
      .map((m) => ({ ...(byId.get(m.id) || {}), id: m.id, score: m.score }))
      .filter((m) => m.product);
  } catch (_e) {
    return [];
  }
}

module.exports = {
  getProductsForUser,
  getClinicianForUser,
  getAllProducts,
  getAllClinicians,
  // MARSHA matrix
  getMatrixProductsByQuestions,
  getMatrixProductsBySemantic,
};
