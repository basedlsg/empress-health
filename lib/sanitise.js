// lib/sanitise.js
// Shared input sanitisation for any text that flows into an LLM prompt.
// Prevents prompt-injection and control-character poisoning of grounded
// retrieval contexts.

const ALLOWED_CATEGORY_SLUGS = new Set([
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

const ALLOWED_STAGES = new Set(["perimenopause", "menopause", "post_menopause"]);

/**
 * Strip ASCII control characters (0x00-0x1F + 0x7F) except \t \n \r.
 * Collapse 4+ consecutive newlines (a common prompt-injection trick).
 * Cap length to prevent token-cost DoS.
 */
function sanitisePromptText(input, { maxLen = 1000 } = {}) {
  if (input === null || input === undefined) return "";
  let s = String(input);
  // strip control chars except tab/newline/carriage return
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // collapse excessive newlines
  s = s.replace(/\n{4,}/g, "\n\n\n");
  // strip common prompt-injection scaffolding
  s = s.replace(/^\s*(?:system|assistant|user)\s*:/gim, "");
  // length cap
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s.trim();
}

/**
 * Return only the slugs that exist in the canonical 10-category set.
 * Anything else (typo, attacker injection, future schema change) is dropped.
 */
function filterCategorySlugs(input) {
  if (!Array.isArray(input)) return [];
  return input.filter((s) => typeof s === "string" && ALLOWED_CATEGORY_SLUGS.has(s));
}

/**
 * Return the stage iff it's in the allowed set, otherwise null.
 */
function validateStage(input) {
  if (typeof input !== "string") return null;
  return ALLOWED_STAGES.has(input) ? input : null;
}

/**
 * Drop anything that isn't an integer 1..120 (the question ID space).
 */
function filterDomainIds(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 10);
}

module.exports = {
  sanitisePromptText,
  filterCategorySlugs,
  validateStage,
  filterDomainIds,
  ALLOWED_CATEGORY_SLUGS,
  ALLOWED_STAGES,
};
