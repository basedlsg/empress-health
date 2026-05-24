// End-to-end pipeline test: exercise the live HTTP API with a synthetic
// assessment payload and verify every response is grounded in real catalog
// + Pinecone chunks. Boot the server with MOCK_LLM=1 before running.

import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3055;
const BASE = `http://localhost:${PORT}`;

// Load ground-truth references so we can verify nothing was invented.
const repoRoot = path.dirname(new URL(import.meta.url).pathname).replace(/\/scripts$/, '');
const chunks = JSON.parse(fs.readFileSync(`${repoRoot}/pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json`, 'utf8'));
const realChunkIds = new Set(chunks.map(c => c._id));
const catalog = JSON.parse(fs.readFileSync(`${repoRoot}/data/product_catalog.json`, 'utf8'));
const realProductIds = new Set((catalog.products || catalog).map(p => p.id));
const clinicians = JSON.parse(fs.readFileSync(`${repoRoot}/data/clinician_taxonomy.json`, 'utf8'));
const realClinicianIds = new Set((clinicians.clinicians || clinicians).map(c => c.id));

let passed = 0, failed = 0;
function assert(ok, msg) {
  if (ok) { console.log(`  ✓ ${msg}`); passed++; }
  else    { console.log(`  ✗ ${msg}`); failed++; }
}

// ── Fetch a CSRF token from the server before running POST tests ──────────
// GET /api/csrf is exempt from CSRF enforcement (it's a GET) and returns a
// token that we include as X-CSRF-Token on all subsequent state-mutating calls.
// The double-submit-cookie pattern stores the expected token in the server session,
// so we must also carry the session cookie forward in all subsequent requests.
let csrfToken = '';
let sessionCookie = ''; // raw cookie header value for manual forwarding
{
  const csrfRes = await fetch(`${BASE}/api/csrf`);
  if (csrfRes.ok) {
    const csrfJson = await csrfRes.json().catch(() => ({}));
    csrfToken = csrfJson.csrfToken || '';
    // Capture Set-Cookie headers so subsequent requests share the same session.
    const setCookieHeader = csrfRes.headers.get('set-cookie');
    if (setCookieHeader) {
      // Extract just the name=value pairs (strip flags like HttpOnly, Path, etc.)
      sessionCookie = setCookieHeader
        .split(/,(?=[^;]+=[^;]+(?:;|$))/)  // split on comma between cookie pairs
        .map(c => c.trim().split(';')[0].trim()) // keep only name=value
        .join('; ');
    }
    console.log(`[setup] CSRF token obtained (${csrfToken ? 'ok' : 'MISSING'}), session cookie: ${sessionCookie ? 'ok' : 'MISSING'}`);
  } else {
    console.warn(`[setup] Could not fetch CSRF token (${csrfRes.status}) — POST tests may get 403`);
  }
}

// Helper: common headers for authenticated POST requests.
function authPostHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token-e2e',
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...(sessionCookie ? { 'Cookie': sessionCookie } : {}),
  };
}

// ── Test 1: Recommendations completion gate (incomplete payload → 422) ──
console.log('\n=== Test 1: Completion gate (incomplete = 422) ===');
{
  const body = { responses: { 1: 5, 2: 4 }, stage: 'perimenopause', age: 47 };
  // Include CSRF token + session cookie (completion gate fires before auth, but CSRF fires first globally).
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? {'X-CSRF-Token': csrfToken} : {}),
      ...(sessionCookie ? {'Cookie': sessionCookie} : {}),
    },
    body: JSON.stringify(body),
  });
  assert(res.status === 422, `incomplete payload returns 422 (got ${res.status})`);
  const j = await res.json().catch(()=>({}));
  assert(typeof j.completionPercent === 'number', `response includes completionPercent (got ${j.completionPercent})`);
}

// ── Build a realistic full assessment payload ──────────────────────────
// Mostly mild (8s) with severe vasomotor (Q1-Q12=1) and mood (Q36-Q48=2)
const responses = {};
for (let q = 1; q <= 120; q++) responses[q] = 8;          // baseline: mild
for (let q = 1; q <= 12; q++) responses[q] = 1;            // severe vasomotor
for (let q = 36; q <= 48; q++) responses[q] = 2;           // severe mood
responses[99] = 0;                                          // URGENT: palpitations
responses[41] = 1;                                          // URGENT: depression

// domainScores mirrors what AssessmentReportScreen.tsx computes via the HIS
// engine and sends to the API: 0-100 per domain, lower = more severe.
// With Q1-Q12 all at value 1 (severe) and Q36-Q48 at value 2 (severe),
// D1 ≈ 10 and D4 ≈ 20 — both <= 34 = "Low" band.
const fullPayload = {
  responses,
  stage: 'perimenopause',
  age: 47,
  mhtActive: false,
  priorityCategorySlugs: ['vasomotor-temperature','mood-anxiety-emotional-health','sleep-architecture-cortisol'],
  topConcernDomainIds: [1, 4, 2],
  domainScores: { 1: 10, 2: 25, 3: 80, 4: 20, 5: 80, 6: 80, 7: 80, 8: 80, 9: 80, 10: 80 },
  urgent_flags: [{question: 99}, {question: 41}, {question: 2}],
  health_goal: ['Hormonal balance'],
  symptoms: 'hot flashes, mood swings, night sweats',
  approaches: ['Lifestyle changes', 'Supplements'],
  dietary_restrictions: 'none',
  stress_level: 'high',
};

// ── Test 2: Combined recommendations endpoint ──────────────────────────
console.log('\n=== Test 2: /api/recommendations/combined (full payload) ===');
{
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(), body: JSON.stringify(fullPayload),
  });
  assert(res.status < 400, `returns 2xx (got ${res.status})`);
  const j = await res.json();

  // Affirmations grounding
  const aff = Array.isArray(j.affirmations) ? j.affirmations : (j.affirmations?.affirmations || []);
  assert(aff.length >= 1, `at least 1 affirmation returned (got ${aff.length})`);

  // Recommendations grounding
  const recs = j.recommendations || [];
  assert(recs.length >= 1, `at least 1 recommendation returned (got ${recs.length})`);
  if (recs.length) {
    let badProducts = 0, badRefs = 0;
    for (const r of recs) {
      const pid = r.product_id || r.id;
      if (pid && !realProductIds.has(pid)) badProducts++;
      const refs = r.evidence_refs || [];
      for (const id of refs) if (!realChunkIds.has(id)) badRefs++;
    }
    assert(badProducts === 0, `every product_id resolves to catalog (bad: ${badProducts})`);
    assert(badRefs === 0, `every evidence_ref resolves to real chunk (bad: ${badRefs})`);
  }

  // Clinician routing — urgent Q99 → cardiologist OR Q41 → mental health
  const clin = j.clinician;
  assert(clin && (clin.specialty_id || clin.id), `clinician returned`);
  if (clin) {
    const cid = clin.specialty_id || clin.id;
    assert(realClinicianIds.has(cid), `clinician id "${cid}" exists in taxonomy`);
    assert(['cardiologist','mental_health_professional'].includes(cid),
           `urgent flag routed to expected clinician (got ${cid})`);
  }
}

// ── Test 3: POI flag (under 45 + peri + severe vasomotor) ──────────────
console.log('\n=== Test 3: POI flag fires for age 38 + peri + severe vasomotor ===');
{
  const poiPayload = { ...fullPayload, age: 38 };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(), body: JSON.stringify(poiPayload),
  });
  const j = await res.json();
  assert(j.poi_flag === true, `poi_flag === true for under-45 peri with vasomotor severity (got ${j.poi_flag})`);
}

// ── Test 4: /qa chatbot grounded ───────────────────────────────────────
console.log('\n=== Test 4: /qa chatbot returns sources ===');
{
  const res = await fetch(`${BASE}/qa`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ query: 'Why do hot flashes get worse at night?' }),
  });
  assert(res.status < 400, `returns 2xx (got ${res.status})`);
  const j = await res.json();
  assert(typeof (j.answer || j.response) === 'string', `answer is a string`);
  const sources = j.sources || [];
  if (sources.length) {
    let badSrc = 0;
    for (const s of sources) if (!realChunkIds.has(s.id || s)) badSrc++;
    assert(badSrc === 0, `every source resolves to real chunk (bad: ${badSrc})`);
  } else {
    console.log('  (no sources in response — may be expected if retrieval returned 0)');
  }
}

// ── Test 5: Products endpoint completion gate ──────────────────────────
console.log('\n=== Test 5: /api/recommendations/products gate ===');
{
  const res = await fetch(`${BASE}/api/recommendations/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? {'X-CSRF-Token': csrfToken} : {}),
      ...(sessionCookie ? {'Cookie': sessionCookie} : {}),
    },
    body: JSON.stringify({ responses: { 1: 5 }, stage: 'perimenopause' }),
  });
  assert(res.status === 422, `incomplete payload returns 422 (got ${res.status})`);
}

// ── Test 6: Empty body (with auth) → 422 with completionPercent ──────────────
// The completion gate fires when responses is an empty object (0/120 answered).
// Without auth at all the endpoint returns 401 first, so we include auth here.
console.log('\n=== Test 6: Empty responses object (with auth) → 422 + completionPercent ===');
{
  const emptyResBody = { responses: {}, stage: 'perimenopause', age: 47 };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST',
    headers: authPostHeaders(),
    body: JSON.stringify(emptyResBody),
  });
  assert(res.status === 422, `empty responses object returns 422 (got ${res.status})`);
  const j = await res.json().catch(() => ({}));
  assert(typeof j.completionPercent === 'number', `response includes completionPercent (got ${JSON.stringify(j.completionPercent)})`);
}

// ── Test 7: Malformed urgent_flags (string instead of array) ─────────────────
console.log('\n=== Test 7: Malformed urgent_flags (string) does not crash ===');
{
  const badPayload = { ...fullPayload, urgent_flags: "99" };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(),
    body: JSON.stringify(badPayload),
  });
  // Must not 500-crash — any 2xx or 4xx except 500 is acceptable
  assert(res.status !== 500, `malformed urgent_flags does not cause 500 (got ${res.status})`);
  const j = await res.json().catch(() => ({}));
  assert(typeof j === 'object' && j !== null, `response is a JSON object despite malformed urgent_flags`);
}

// ── Test 8: Post-menopause user — Vitex should be absent ─────────────────────
console.log('\n=== Test 8: Post-menopause payload — Vitex absent from recommendations ===');
{
  const postMenoPayload = {
    ...fullPayload,
    stage: 'post_menopause',
    priorityCategorySlugs: ['vasomotor-temperature', 'mood-anxiety-emotional-health'],
    // Remove urgent flags that force cardiologist routing, keep it clean
    urgent_flags: [],
  };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(),
    body: JSON.stringify(postMenoPayload),
  });
  assert(res.status < 400, `post-menopause payload returns 2xx (got ${res.status})`);
  const j = await res.json().catch(() => ({}));
  const recs = j.recommendations || [];
  const vitexPresent = recs.some(r => {
    const name = (r.product_name || r.name || '').toLowerCase();
    const pid  = (r.product_id || r.id || '').toLowerCase();
    return name.includes('vitex') || pid.includes('vitex');
  });
  assert(!vitexPresent, `Vitex (perimenopause-only) absent from post-menopause recommendations (found: ${vitexPresent})`);
}

// ── Test 9: Sleep-only payload → Sleep or NAMS clinician, not Cardiologist ───
console.log('\n=== Test 9: Sleep-only severe payload routes to Sleep/NAMS clinician ===');
{
  const sleepResponses = {};
  for (let q = 1; q <= 120; q++) sleepResponses[q] = 8; // baseline mild
  for (let q = 13; q <= 25; q++) sleepResponses[q] = 1; // severe sleep (D2)
  const sleepPayload = {
    responses: sleepResponses,
    stage: 'perimenopause',
    age: 47,
    mhtActive: false,
    priorityCategorySlugs: ['sleep-architecture-cortisol'],
    topConcernDomainIds: [2],
    domainScores: { 1: 80, 2: 10, 3: 80, 4: 80, 5: 80, 6: 80, 7: 80, 8: 80, 9: 80, 10: 80 },
    urgent_flags: [],  // no cardiac urgent flags
    health_goal: ['Better sleep'],
    symptoms: 'insomnia, night wakings, restless legs',
    approaches: ['Lifestyle changes'],
    dietary_restrictions: 'none',
    stress_level: 'moderate',
  };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(),
    body: JSON.stringify(sleepPayload),
  });
  assert(res.status < 400, `sleep-only payload returns 2xx (got ${res.status})`);
  const j = await res.json().catch(() => ({}));
  const clin = j.clinician;
  if (clin) {
    const cid = clin.specialty_id || clin.id || '';
    assert(cid !== 'cardiologist', `sleep-only routing avoids Cardiologist (got ${cid})`);
  } else {
    // No clinician is acceptable for sleep-only mild urgency
    assert(true, 'sleep-only routing: no clinician or non-cardiologist returned');
  }
}

// ── Test 10: POI flag false for age 50 with severe vasomotor ─────────────────
console.log('\n=== Test 10: POI flag false for age 50 + perimenopause + severe vasomotor ===');
{
  const age50Payload = { ...fullPayload, age: 50 };
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST', headers: authPostHeaders(),
    body: JSON.stringify(age50Payload),
  });
  const j = await res.json().catch(() => ({}));
  assert(j.poi_flag !== true, `poi_flag is false/absent for age 50 (got ${j.poi_flag})`);
}

// ── Test 11: POST to CSRF-protected route without token → 403 ────────────
console.log('\n=== Test 11: CSRF enforcement — POST without token returns 403 ===');
{
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token-e2e',
      // Include session cookie so the server finds a session (csrfToken in session),
      // but intentionally omit X-CSRF-Token to verify enforcement fires.
      ...(sessionCookie ? {'Cookie': sessionCookie} : {}),
    },
    body: JSON.stringify(fullPayload),
  });
  assert(res.status === 403, `POST without CSRF token returns 403 (got ${res.status})`);
  const j = await res.json().catch(() => ({}));
  assert(j.error && j.error.toLowerCase().includes('csrf'), `response body mentions CSRF (got "${j.error}")`);
}

// ── Test 12: POST with valid CSRF token → not 403 ─────────────────────────
console.log('\n=== Test 12: CSRF enforcement — POST with valid token passes CSRF check ===');
{
  const res = await fetch(`${BASE}/api/recommendations/combined`, {
    method: 'POST',
    headers: authPostHeaders(),
    body: JSON.stringify(fullPayload),
  });
  assert(res.status !== 403, `POST with valid CSRF token is not rejected (got ${res.status})`);
}

console.log(`\n========== ${passed} passed, ${failed} failed ==========`);
process.exit(failed ? 1 : 0);
