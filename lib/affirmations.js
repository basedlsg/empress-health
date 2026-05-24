"use strict";

/**
 * lib/affirmations.js — Retrieval-grounded affirmation generation
 *
 * Exports: generateAffirmations(userProfile, requestId, { callGroqAPI })
 *
 * MOCK_LLM=1 short-circuits all LLM calls and returns a deterministic stub
 * whose structure exercises the full validation path.
 */

const path = require("path");
const fs   = require("fs");
const { retrieveContext } = require("./retrieval");

const FALLBACK_FILE = path.join(__dirname, "..", "data", "fallback_affirmations.json");

// ─── Hardcoded fallback loader ────────────────────────────────────────────────
function loadFallback(priorityCategorySlugs = []) {
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, "utf8");
    const { fallbacks } = JSON.parse(raw);
    if (!Array.isArray(fallbacks) || fallbacks.length === 0) return [];

    // If we know the user's priorities, prefer matching entries; otherwise all
    if (priorityCategorySlugs.length > 0) {
      const slugSet = new Set(priorityCategorySlugs);
      const matched = fallbacks.filter((f) => slugSet.has(f.focus_domain));
      if (matched.length >= 3) return matched.slice(0, 5);
    }
    return fallbacks.slice(0, 5);
  } catch (err) {
    console.error("[affirmations] Failed to load fallback file:", err.message);
    return [];
  }
}

// ─── Build LLM system prompt ──────────────────────────────────────────────────
function buildSystemPrompt(userProfile, context) {
  // Sanitise EVERY interpolated user-provided value (prompt-injection defence).
  const { validateStage, filterCategorySlugs, sanitisePromptText } = require("./sanitise");
  const stage     = validateStage(userProfile.stage) || "perimenopause";
  const safeSlugs = filterCategorySlugs(userProfile.priorityCategorySlugs);
  const slugs     = safeSlugs.length ? safeSlugs.join(", ") : "menopause symptoms";
  const mhtNote   = userProfile.mhtActive
    ? "She is currently on MHT."
    : "She is not currently on MHT.";
  const safeContext = sanitisePromptText(context, { maxLen: 8000 });

  return `You are writing 3 short affirmations for a woman in ${stage} menopause.
Her priority symptom areas are: ${slugs}.
${mhtNote}

USE ONLY THE CLINICAL CONTEXT BELOW to ground what you write — do not invent symptom mechanisms, lab values, treatments, or drug names. If the context mentions "thermoregulatory zone narrowing", you may reference that mechanism by name; if it does not mention something, do not introduce it.

Each affirmation must be:
(a) 1-2 sentences max
(b) emotionally grounding (not bossy or clinical)
(c) reference at least one specific symptom domain from her priorities (e.g., "when the heat rises mid-meeting..." rather than "whatever you're feeling")
(d) actionable in tone but NOT prescribing treatments

--- CLINICAL CONTEXT ---
${safeContext}
--- END CLINICAL CONTEXT ---

Output JSON exactly:
{"affirmations": [{"text": "...", "focus_domain": "vasomotor-temperature", "evidence_refs": ["empress-120-symptom-biomarker-framework-chunk-N"]}, ...]}

Every affirmation MUST have at least one evidence_ref drawn from the provided context. Return ONLY the JSON object, no additional text.`;
}

// ─── Validate LLM response ────────────────────────────────────────────────────
function validateResponse(parsed, priorityCategorySlugs, validChunkIds) {
  const errors = [];

  if (!parsed || !Array.isArray(parsed.affirmations) || parsed.affirmations.length < 1) {
    errors.push("Missing or empty affirmations array");
    return errors;
  }

  const prioritySet = new Set(priorityCategorySlugs);
  const validSet    = new Set(validChunkIds);

  for (let i = 0; i < parsed.affirmations.length; i++) {
    const aff = parsed.affirmations[i];
    if (!aff.text || typeof aff.text !== "string" || aff.text.trim().length === 0) {
      errors.push(`Affirmation[${i}]: missing text`);
    }
    if (!Array.isArray(aff.evidence_refs) || aff.evidence_refs.length === 0) {
      errors.push(`Affirmation[${i}]: must have at least one evidence_ref`);
    } else {
      const badRefs = aff.evidence_refs.filter((r) => !validSet.has(r));
      if (badRefs.length > 0) {
        errors.push(`Affirmation[${i}]: evidence_refs not in retrieval citations: ${badRefs.join(", ")}`);
      }
    }
    if (prioritySet.size > 0 && !prioritySet.has(aff.focus_domain)) {
      errors.push(`Affirmation[${i}]: focus_domain "${aff.focus_domain}" not in user priorities`);
    }
  }

  return errors;
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * generateAffirmations(userProfile, requestId, deps)
 *
 * deps.callGroqAPI — injected so tests can pass a mock
 *
 * Returns:
 * {
 *   affirmations: [{ text, focus_domain, evidence_refs }],
 *   citations: [{ id, score, snippet }],
 *   // DEPRECATED: legacy field for backward compat with existing frontend.
 *   // Remove once all callsites consume the structured shape.
 *   legacyStrings: string[]
 * }
 */
async function generateAffirmations(userProfile, requestId = "aff", { callGroqAPI } = {}) {
  const slugs    = userProfile.priorityCategorySlugs || [];
  const domainIds = userProfile.topConcernDomainIds || [];
  const stage    = userProfile.stage || "perimenopause";

  // ── MOCK_LLM path ──────────────────────────────────────────────────────────
  if (process.env.MOCK_LLM === "1") {
    console.log(`[${requestId}] MOCK_LLM=1 — skipping Groq call`);
    // Still run retrieval so validation exercises real chunk IDs
    let ctxResult;
    try {
      ctxResult = await retrieveContext({
        query: `menopause ${stage} ${slugs.join(" ")} clinical mechanism support`,
        k: 4,
        filter: slugs.length ? { category_slugs: slugs, stage } : {},
        maxChars: 2400,
      });
    } catch (e) {
      ctxResult = { context: "", citations: [] };
    }

    // Build a stub that passes validation using the real chunk IDs we got back
    const realIds = ctxResult.citations.map((c) => c.id);
    const mockAffirmations = (slugs.length > 0 ? slugs : ["vasomotor-temperature"]).map((slug, idx) => ({
      text: `[MOCK] When the signal rises, your body is communicating — not failing. (${slug})`,
      focus_domain: slug,
      evidence_refs: realIds.length > 0 ? [realIds[idx % realIds.length]] : [],
    }));

    return {
      affirmations: mockAffirmations,
      citations: ctxResult.citations.map((c) => ({
        id: c.id,
        score: c.score,
        snippet: "",
      })),
      legacyStrings: mockAffirmations.map((a) => a.text),
    };
  }

  // ── Retrieval with cascading filters ──────────────────────────────────────
  let ctxResult = null;

  // Attempt 1: category_slugs + stage filter
  if (slugs.length > 0) {
    ctxResult = await retrieveContext({
      query: `menopause ${stage} ${slugs.join(" ")} clinical mechanism support`,
      k: 4,
      filter: { category_slugs: slugs, stage },
      maxChars: 2400,
    });
    if (ctxResult.citations.length === 0) {
      console.warn(`[${requestId}] Retrieval attempt 1 returned 0 chunks; loosening filter`);
      ctxResult = null;
    }
  }

  // Attempt 2: domain_ids only
  if (!ctxResult && domainIds.length > 0) {
    ctxResult = await retrieveContext({
      query: `menopause ${stage} ${slugs.join(" ")} symptom support`,
      k: 4,
      filter: { domain_ids: domainIds },
      maxChars: 2400,
    });
    if (ctxResult.citations.length === 0) {
      console.warn(`[${requestId}] Retrieval attempt 2 returned 0 chunks; removing filter`);
      ctxResult = null;
    }
  }

  // Attempt 3: no filter
  if (!ctxResult) {
    ctxResult = await retrieveContext({
      query: `menopause ${stage} symptom support`,
      k: 4,
      filter: {},
      maxChars: 2400,
    });
  }

  // Attempt 4: hard fallback — no LLM
  if (!ctxResult || ctxResult.citations.length === 0) {
    console.warn(`[${requestId}] All retrieval attempts returned 0 chunks — returning hardcoded fallback`);
    const fallbacks = loadFallback(slugs);
    return {
      affirmations: fallbacks,
      citations: [],
      legacyStrings: fallbacks.map((a) => a.text),
    };
  }

  const { context, citations } = ctxResult;
  const validChunkIds = citations.map((c) => c.id);

  const sysPrompt  = buildSystemPrompt(userProfile, context);
  const userPrompt = `Generate 3 grounded affirmations for this user's profile: stage=${stage}, priority areas=${slugs.join(", ")}.`;

  // ── LLM call — attempt 1 ──────────────────────────────────────────────────
  let parsed;
  let attempt1Errors;
  try {
    const raw = await callGroqAPI(sysPrompt, userPrompt, requestId);
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.warn(`[${requestId}] Failed to parse Groq JSON:`, e.message);
      parsed = null;
    }
    attempt1Errors = parsed
      ? validateResponse(parsed, slugs, validChunkIds)
      : ["JSON parse failure"];
  } catch (err) {
    console.error(`[${requestId}] Groq call failed:`, err.message);
    attempt1Errors = [`Groq error: ${err.message}`];
    parsed = null;
  }

  if (attempt1Errors.length === 0) {
    return formatResult(parsed, citations);
  }

  // ── LLM call — attempt 2 (validation failed) ─────────────────────────────
  console.warn(`[${requestId}] Validation failed (attempt 1): ${attempt1Errors.join("; ")}. Retrying.`);
  const retryUser = `VALIDATION_FAILED: ${attempt1Errors.join("; ")}. Try again following the JSON contract strictly.\n\n${userPrompt}`;

  try {
    const raw2 = await callGroqAPI(sysPrompt, retryUser, requestId + "-retry");
    try {
      parsed = JSON.parse(raw2);
    } catch {
      parsed = null;
    }
    const attempt2Errors = parsed
      ? validateResponse(parsed, slugs, validChunkIds)
      : ["JSON parse failure on retry"];

    if (attempt2Errors.length === 0) {
      return formatResult(parsed, citations);
    }
    console.warn(`[${requestId}] Validation failed (attempt 2): ${attempt2Errors.join("; ")}. Using hardcoded fallback.`);
  } catch (err) {
    console.error(`[${requestId}] Groq retry call failed:`, err.message);
  }

  // ── Final fallback ────────────────────────────────────────────────────────
  const fallbacks = loadFallback(slugs);
  return {
    affirmations: fallbacks,
    citations: [],
    legacyStrings: fallbacks.map((a) => a.text),
  };
}

function formatResult(parsed, citations) {
  return {
    affirmations: parsed.affirmations,
    citations: citations.map((c) => ({
      id: c.id,
      score: c.score,
      snippet: "",
    })),
    // DEPRECATED: legacy string array for backward compat. Remove once frontend is updated.
    legacyStrings: parsed.affirmations.map((a) => a.text),
  };
}

module.exports = { generateAffirmations };
