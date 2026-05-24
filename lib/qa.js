"use strict";

/**
 * lib/qa.js — Retrieval-grounded "Ask Empress" QA handler
 *
 * Exports: handleQA(opts) → { answer, sources }
 *
 * MOCK_LLM=1 returns a deterministic stub without touching OpenAI.
 */

const { retrieveContext } = require("./retrieval");
const { sanitisePromptText } = require("./sanitise");

const NO_INFO_ANSWER =
  "I don't have specific information on that — please ask your NAMS-certified provider.";

const QUERY_MAX_CHARS = 800;

/**
 * handleQA({ query, callOpenAI, requestId })
 *
 * callOpenAI(messages, signal) — injected so tests can mock it.
 * Should resolve to the answer string or throw.
 *
 * Returns: { answer: string, sources: [{ id, score, snippet }] }
 */
async function handleQA({ query, callOpenAI, requestId = "qa" } = {}) {
  // 1. Length-cap AND strip control chars / prompt-injection scaffolding
  const trimmedQuery = sanitisePromptText(query, { maxLen: QUERY_MAX_CHARS });

  if (!trimmedQuery) {
    return { answer: "Ask a question to get started.", sources: [] };
  }

  // 2. Retrieve grounding context
  let ctxResult;
  try {
    ctxResult = await retrieveContext({
      query: trimmedQuery,
      k: 5,
      maxChars: 3000,
    });
  } catch (err) {
    console.error(`[${requestId}] Retrieval failed:`, err.message);
    return { answer: NO_INFO_ANSWER, sources: [] };
  }

  // 3. No evidence found — skip LLM entirely
  if (!ctxResult || ctxResult.citations.length === 0) {
    console.warn(`[${requestId}] Retrieval returned 0 chunks — returning safe fallback`);
    return { answer: NO_INFO_ANSWER, sources: [] };
  }

  // 3b. Low-confidence guard — top result below threshold = noise, not evidence
  const { MIN_SCORE_THRESHOLD } = require("./retrieval");
  const topScore = ctxResult.citations[0]?.score ?? 0;
  if (topScore < MIN_SCORE_THRESHOLD) {
    console.warn(
      `[${requestId}] Top retrieval score ${topScore.toFixed(4)} below threshold ` +
      `${MIN_SCORE_THRESHOLD} — skipping LLM to avoid low-confidence hallucination`
    );
    return { answer: NO_INFO_ANSWER, sources: [] };
  }

  const { context, citations } = ctxResult;

  // 4. MOCK_LLM path
  if (process.env.MOCK_LLM === "1") {
    const mockSourceIds = citations.map((c) => c.id).join(", ");
    return {
      answer: `[MOCK ANSWER] This is a stub response grounded in retrieved evidence.\n\nSources: ${mockSourceIds}`,
      sources: citations.map((c) => ({ id: c.id, score: c.score, snippet: "" })),
    };
  }

  // 5. Build system prompt with clinical evidence injected (sanitised)
  const safeContext = sanitisePromptText(context, { maxLen: 6000 });
  const systemPrompt = `You are Empress Health's clinically-informed menopause companion. You answer ONLY using the clinical evidence provided below. If the answer is not present in the evidence, say plainly: "${NO_INFO_ANSWER}" and stop.

--- CLINICAL EVIDENCE ---
${safeContext}
--- END CLINICAL EVIDENCE ---

Output rules:
- Answer in plain English, under 200 words.
- After your answer, add a line: "Sources: <chunk IDs you used, comma-separated>"
- Do NOT invent statistics, drug names, dosages, or trial citations.
- Do NOT use the phrase "as an AI".
- Do NOT recommend specific products by name.`;

  // 6. Call OpenAI via injected helper
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let rawAnswer;
  try {
    rawAnswer = await callOpenAI(
      systemPrompt,
      trimmedQuery,
      controller.signal
    );
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`[${requestId}] OpenAI QA timed out`);
    } else {
      console.error(`[${requestId}] OpenAI QA failed:`, err.message);
    }
    return { answer: NO_INFO_ANSWER, sources: [] };
  } finally {
    clearTimeout(timeout);
  }

  // 7. Return structured response — guard against non-string answer
  const safeAnswer = (typeof rawAnswer === "string" && rawAnswer.trim())
    ? rawAnswer
    : NO_INFO_ANSWER;

  return {
    answer: safeAnswer,
    sources: citations.map((c) => ({ id: c.id, score: c.score, snippet: "" })),
  };
}

module.exports = { handleQA };
