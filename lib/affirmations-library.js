"use strict";

/**
 * lib/affirmations-library.js — the team's curated affirmations
 * ("Affirmations (Positive & Growth States)" workbook), 13 themes, each a
 * Caption + Description. Imported into data/affirmations-library.json by
 * scripts/import-affirmations-xlsx.mjs; this module picks from it.
 *
 * Personalisation: a member's priority body systems from the assessment map to
 * the themes that speak to them (DOMAIN_THEMES below — edit freely), and the
 * picks vary by member and by day so repeat emails do not repeat themselves.
 */

const fs = require("fs");
const path = require("path");

const LIBRARY_FILE = path.join(__dirname, "..", "data", "affirmations-library.json");

// Assessment domain slug → themes (first is the lead theme for that domain).
const DOMAIN_THEMES = {
  "vasomotor-temperature":             ["Balance", "Peace", "Resilience"],
  "sleep-architecture-cortisol":       ["Peace", "Healing", "Balance"],
  "cognitive-function-brain-health":   ["Self-Confidence", "Power", "Purpose"],
  "mood-anxiety-emotional-health":     ["Peace", "Hope", "Joy", "Compassion"],
  "metabolic-health-body-composition": ["Energy", "Power", "Gratitude"],
  "skin-hair-nails":                   ["Self-Confidence", "Compassion", "Gratitude"],
  "musculoskeletal-bone-health":       ["Power", "Resilience", "Energy"],
  "genitourinary-sexual-health":       ["Self-Confidence", "Connection", "Healing"],
  "cardiovascular-whole-body-energy":  ["Energy", "Healing", "Power"],
  "lifestyle-gut-health-nutrition":    ["Balance", "Healing", "Gratitude"],
};
// Used to top up when a member has fewer than three known priority domains.
const DEFAULT_DOMAINS = [
  "mood-anxiety-emotional-health",
  "sleep-architecture-cortisol",
  "vasomotor-temperature",
];

let cached = null;
function load() {
  if (cached !== null) return cached;
  try {
    const raw = JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf8"));
    const themes = {};
    for (const [theme, rows] of Object.entries(raw.themes || {})) {
      themes[theme] = rows
        .filter((r) => Array.isArray(r) && r[1])
        .map(([number, caption, description]) => ({ number, caption, description: description || "" }));
    }
    cached = Object.keys(themes).length ? { themes, source: raw.source } : false;
  } catch (err) {
    console.error("[affirmations-library] could not load library:", err.message);
    cached = false;
  }
  return cached;
}

function isAvailable() {
  return Boolean(load());
}

// FNV-1a, 32-bit — small, stable, good enough to spread picks.
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * pickAffirmations({ slugs, seed, count })
 *
 * slugs — the member's priority domain slugs, most important first.
 * seed  — any string; the same seed gives the same picks (use member + date).
 * Returns [{ text, caption, description, theme, focus_domain, evidence_refs, source }].
 */
function pickAffirmations({ slugs = [], seed = "", count = 6 } = {}) {
  const lib = load();
  if (!lib) return [];

  const domains = [];
  for (const slug of [...slugs, ...DEFAULT_DOMAINS]) {
    if (DOMAIN_THEMES[slug] && !domains.includes(slug)) domains.push(slug);
    if (domains.length >= Math.max(3, Math.min(slugs.length, 5))) break;
  }

  const picked = [];
  const usedCaptions = new Set();
  for (let i = 0; i < count && domains.length; i += 1) {
    const domain = domains[i % domains.length];
    const round = Math.floor(i / domains.length);
    const themeList = DOMAIN_THEMES[domain].filter((t) => lib.themes[t] && lib.themes[t].length);
    if (!themeList.length) continue;
    const theme = themeList[(round + hash(`${seed}|${domain}`)) % themeList.length];
    const pool = lib.themes[theme];
    let index = hash(`${seed}|${domain}|${theme}|${i}`) % pool.length;
    // Never show the same caption twice in one set.
    for (let tries = 0; tries < pool.length && usedCaptions.has(pool[index].caption.toLowerCase()); tries += 1) {
      index = (index + 1) % pool.length;
    }
    const item = pool[index];
    usedCaptions.add(item.caption.toLowerCase());
    picked.push({
      text: `${item.caption} ${item.description}`.trim(),
      caption: item.caption,
      description: item.description,
      theme,
      focus_domain: domain,
      evidence_refs: [],
      source: "affirmations-library",
    });
  }
  return picked;
}

function stats() {
  const lib = load();
  if (!lib) return null;
  return {
    source: lib.source,
    themes: Object.fromEntries(Object.entries(lib.themes).map(([t, rows]) => [t, rows.length])),
  };
}

module.exports = { pickAffirmations, isAvailable, stats, DOMAIN_THEMES };
