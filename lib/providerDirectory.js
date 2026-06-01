// lib/providerDirectory.js
// Location-matched doctor recommendations, read from the curated menopause
// directory (data/menopause-directory.json — 269 vetted providers across the
// states we cover). Matches on the user's US state, then sorts by ZIP
// proximity so the closest providers surface first.
//
// State match is forgiving: directory entries like "Texas (Dallas)" and
// "Washington (Seattle)" normalise to "texas" / "washington", so a user who
// picks "Texas" matches every Texas record regardless of the parenthetical.

const fs = require("fs");
const path = require("path");

let CACHE = null;

function loadDirectory() {
  if (CACHE) return CACHE;
  try {
    const p = path.join(__dirname, "..", "data", "menopause-directory.json");
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    CACHE = Array.isArray(raw) ? raw : raw.providers || raw.records || [];
  } catch (err) {
    console.warn("[providerDirectory] could not load directory:", err.message);
    CACHE = [];
  }
  return CACHE;
}

/** "Texas (Dallas)" -> "texas", "New York" -> "newyork" */
function normState(s) {
  if (!s || typeof s !== "string") return "";
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z]/g, "");
}

/**
 * @param {object} opts
 * @param {string} opts.state  Full US state name (e.g. "California").
 * @param {string} [opts.zip]  5-digit ZIP for proximity sorting (ideal).
 * @param {number} [opts.k]    Max providers to return.
 * @returns {{ providers: object[], matchedState: string|null }}
 */
function getProvidersByLocation({ state, zip, k = 4 } = {}) {
  const all = loadDirectory();
  const wantState = normState(state);
  if (!wantState) return { providers: [], matchedState: null };

  const inState = all.filter((p) => normState(p.state) === wantState);
  if (!inState.length) return { providers: [], matchedState: null };

  let pool = inState;
  const wantZip = String(zip || "").replace(/[^\d]/g, "").slice(0, 5);
  if (/^\d{5}$/.test(wantZip)) {
    const target = Number(wantZip);
    pool = inState.slice().sort((a, b) => {
      const az = Number(String(a.zip || "").replace(/[^\d]/g, ""));
      const bz = Number(String(b.zip || "").replace(/[^\d]/g, ""));
      const ad = Number.isFinite(az) ? Math.abs(az - target) : Infinity;
      const bd = Number.isFinite(bz) ? Math.abs(bz - target) : Infinity;
      return ad - bd;
    });
  }

  const providers = pool.slice(0, Math.max(1, k)).map((p) => ({
    name: p.name,
    qualification: p.qualification || p.category || null,
    category: p.category || null,
    state: p.state || null,
    address: p.address || null,
    phone: p.phone || null,
    website: p.website || null,
    linkedin: p.linkedin || null,
    zip: p.zip || null,
  }));

  return { providers, matchedState: state };
}

module.exports = { getProvidersByLocation };
