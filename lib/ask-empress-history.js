'use strict';

const { sanitisePromptText } = require('./sanitise');

// Browser history is conversation context, never clinical evidence. Bound it
// before it reaches retrieval or the model; accept completed exchanges only.
function normaliseHistory(history) {
  if (!Array.isArray(history)) return [];
  const result = [];
  let remaining = 6000;
  for (const entry of history.slice(-8).reverse()) {
    if (!entry || typeof entry.question !== 'string' || typeof entry.answer !== 'string') continue;
    const question = sanitisePromptText(entry.question, { maxLen: 800 });
    const answer = sanitisePromptText(entry.answer, { maxLen: 1800 });
    if (!question || !answer || question.length + answer.length > remaining) continue;
    result.unshift({ question, answer });
    remaining -= question.length + answer.length;
  }
  return result;
}

function retrievalQuestion(query, history) {
  const followUp = /^(?:and\b|also\b|what about\b|how about\b|tell me more\b|why[?!.]*$|can you explain[?!.]*$)|\b(?:it|that|these|those|earlier|previous|mentioned|my symptoms)\b/i.test(query);
  return followUp && history.length
    ? history.slice(-2).map(entry => entry.question).concat(query).join('\n').slice(-2400)
    : query;
}

module.exports = { normaliseHistory, retrievalQuestion };
