// lib/gemini.js — Google Gemini LLM wrapper (replaces Groq + OpenAI).
//
// Single entry point: callGemini(opts) → string answer.
// Same signature shape as the previous callOpenAI / callGroqAPI helpers so
// upstream callers in lib/qa.js and lib/affirmations.js don't need changes —
// server.js just injects the new helper where it used to inject the old ones.
//
// API: https://ai.google.dev/api/generate-content
// Default model: gemini-3.6-flash (Google's recommended replacement for the
// retired gemini-2.0-flash model).

"use strict";

// Keep this configurable so production can deliberately pin a newer stable
// model without a code deploy.
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const API_BASE      = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_TIMEOUT_MS = 15000;
// Wall-clock budget for one callGemini() across every retry and fallback
// model. Without it the worst case was 3 models x 4 attempts x 30s — minutes
// — while the serverless function dies at 30s and the assessment report sat
// on its loading screen. Past the budget we throw so callers use their
// non-LLM fallback.
const TOTAL_BUDGET_MS = Number(process.env.GEMINI_TOTAL_BUDGET_MS || 20000);

// When Google returns 503 / 429 we retry with exponential backoff. The
// gemini-2.5-flash model in particular has been throwing transient overloads
// — even a single retry typically clears them, but we allow up to 3.
const MAX_RETRIES        = 3;
const RETRY_BASE_DELAY_MS = 500;

// Fallback models tried in order if the primary model returns 503 on every
// retry attempt. Lets us survive a single overloaded model. All entries must
// be live v1beta `generateContent` models — verified via ListModels.
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class GeminiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name   = "GeminiError";
    this.status = status;
    this.body   = body;
  }
}

/**
 * callGemini({ systemPrompt, userPrompt, signal, model, temperature, maxOutputTokens, json })
 *   systemPrompt:     string — clinical context + rules
 *   userPrompt:       string — the user query / task instruction
 *   signal:           optional AbortSignal for upstream timeout integration
 *   model:            optional Gemini model (default gemini-3.6-flash)
 *   temperature:      0..1 (default 0.4)
 *   maxOutputTokens:  default 1024
 *   json:             true → set responseMimeType=application/json
 *
 * Returns: the model's text output as a plain string. Caller can JSON.parse
 * it if the prompt asked for structured output.
 */
async function callGemini({
  systemPrompt,
  userPrompt,
  signal,
  model           = DEFAULT_MODEL,
  temperature     = 0.4,
  maxOutputTokens = 1024,
  json            = false,
} = {}) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "GOOGLE_API_KEY (or GEMINI_API_KEY) is not set. Set it locally in .env and on Vercel via `vercel env add`."
    );
  }
  if (!userPrompt || typeof userPrompt !== "string") {
    throw new GeminiError("callGemini: userPrompt is required (string).");
  }

  // Build the model fallback chain. Primary model first, then any fallback
  // models that aren't already the primary (preserves explicit override but
  // still tries proven-stable models when the requested one is overloaded).
  const tryOrder = [model, ...FALLBACK_MODELS.filter((m) => m !== model)];
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  let lastError = null;
  for (const m of tryOrder) {
    if (Date.now() >= deadline) break;
    try {
      return await callGeminiOnce({
        apiKey, model: m,
        systemPrompt, userPrompt, signal,
        temperature, maxOutputTokens, json, deadline,
      });
    } catch (err) {
      lastError = err;
      // Switch models on transient failures and on a missing/retired model.
      // Other 4xx responses (bad request, blocked prompt, invalid key) should
      // fail fast because trying another model cannot fix them.
      if (!isRetryableStatus(err?.status) && !isModelUnavailableStatus(err?.status)) {
        throw err;
      }
      // Otherwise loop to the next model in the fallback chain.
    }
  }
  // Every model in the chain failed.
  throw lastError || new GeminiError("Gemini: all candidate models failed.");
}

// True for transient server-side failures that warrant a retry / fallback.
function isRetryableStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function isModelUnavailableStatus(status) {
  return status === 404;
}

// Single-model attempt with internal retry/backoff. Throws the last error
// after MAX_RETRIES retryable failures, or immediately on a non-retryable one.
async function callGeminiOnce({
  apiKey, model,
  systemPrompt, userPrompt, signal,
  temperature, maxOutputTokens, json, deadline = Infinity,
}) {
  const url  = `${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
      // Gemini 3.x flash models think by default, and those thinking tokens
      // are drawn from the same maxOutputTokens budget — a short budget (as
      // used here for fast QA/affirmation calls) was being fully consumed by
      // thinking, leaving finishReason=MAX_TOKENS with no visible text at
      // all. Disable thinking so the whole budget goes to the answer.
      thinkingConfig: { thinkingBudget: 0 },
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
    safetySettings: [
      // The Empress chatbot operates in a clinical-health domain — block only
      // the most extreme categories so legitimate menopause / mental-health
      // queries (depression, sexual health, hormone therapy) aren't refused.
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };
  if (systemPrompt && typeof systemPrompt === "string") {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw lastError || new GeminiError(`Gemini: time budget exhausted (${model}).`, { status: 504 });
    }
    // Compose an AbortController if the caller didn't provide one. We always
    // need a timeout — Gemini can hang on rare degenerate prompts.
    let controller = null;
    let timeoutHandle = null;
    let effectiveSignal = signal;
    if (!effectiveSignal) {
      controller = new AbortController();
      effectiveSignal = controller.signal;
      timeoutHandle = setTimeout(() => controller.abort(), Math.min(DEFAULT_TIMEOUT_MS, remaining));
    }

    let res, text;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: effectiveSignal,
      });
      text = await res.text();
    } catch (err) {
      // Network / abort errors — retry on transient ones too.
      if (timeoutHandle) clearTimeout(timeoutHandle);
      lastError = new GeminiError(`Gemini fetch failed: ${err.message}`, { status: 504 });
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      throw lastError;
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }

    if (!res.ok) {
      const err = new GeminiError(
        `Gemini ${res.status} ${res.statusText} (${model}): ${text.slice(0, 400)}`,
        { status: res.status, body: text }
      );
      // Non-retryable: surface immediately so caller can fall back / show
      // a clean error.
      if (!isRetryableStatus(res.status)) {
        throw err;
      }
      lastError = err;
      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 500ms, 1s, 2s.
        await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }

    let payload;
    try { payload = JSON.parse(text); }
    catch {
      throw new GeminiError(`Gemini returned non-JSON: ${text.slice(0, 200)}`);
    }

    // Surfaced when the model returned no completion (safety block, empty input).
    const candidate = payload.candidates && payload.candidates[0];
    if (!candidate) {
      if (payload.promptFeedback?.blockReason) {
        throw new GeminiError(
          `Gemini blocked the prompt: ${payload.promptFeedback.blockReason}`,
          { body: text }
        );
      }
      throw new GeminiError("Gemini returned no candidates.", { body: text });
    }
    const finishReason = candidate.finishReason;
    if (finishReason === "SAFETY") {
      throw new GeminiError("Gemini blocked the response for safety.", { body: text });
    }

    const parts = candidate.content?.parts || [];
    const out = parts.map((p) => p.text || "").join("").trim();
    if (!out) {
      throw new GeminiError(
        `Gemini returned empty text (finishReason=${finishReason || "unknown"}).`,
        { body: text }
      );
    }
    return out;
  }
  throw lastError || new GeminiError("Gemini: exhausted retries with no error.");
}

module.exports = { callGemini, GeminiError };
