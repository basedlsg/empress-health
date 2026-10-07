"use strict";

const { callGemini } = require("./gemini");

// Keep the existing hosted provider unless an open model server is configured.
// Ollama and vLLM both expose the OpenAI-compatible chat completions API.
async function callAskEmpressModel(systemPrompt, userPrompt, signal) {
  const provider = process.env.ASK_EMPRESS_PROVIDER || "gemini";
  if (provider === "gemini") {
    return callGemini({ systemPrompt, userPrompt, signal, temperature: 0.3, maxOutputTokens: 1024 });
  }
  if (provider !== "openai-compatible") {
    throw new Error("Unsupported ASK_EMPRESS_PROVIDER");
  }
  const base = process.env.ASK_EMPRESS_BASE_URL;
  const model = process.env.ASK_EMPRESS_MODEL;
  if (!base || !model) {
    throw new Error("ASK_EMPRESS_BASE_URL and ASK_EMPRESS_MODEL are required");
  }
  const endpoint = new URL(base.replace(/\/+$/, "") + "/chat/completions");
  if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
    throw new Error("Invalid ASK_EMPRESS_BASE_URL");
  }
  const headers = { "Content-Type": "application/json" };
  if (process.env.ASK_EMPRESS_API_KEY) {
    headers.Authorization = `Bearer ${process.env.ASK_EMPRESS_API_KEY}`;
  }
  const timeout = AbortSignal.timeout(25000);
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`Ask Empress model service returned HTTP ${response.status}`);
  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Ask Empress model service returned an empty answer");
  }
  return answer.trim();
}

module.exports = { callAskEmpressModel };
