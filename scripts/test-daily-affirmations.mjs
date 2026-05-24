/**
 * scripts/test-daily-affirmations.mjs
 *
 * Test harness for lib/daily-affirmations.js
 * Run with: MOCK_LLM=1 node scripts/test-daily-affirmations.mjs
 *
 * Uses file-based storage (no DB required).
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Ensure MOCK_LLM is set
if (!process.env.MOCK_LLM) {
  process.env.MOCK_LLM = '1';
}

const da = require('../lib/daily-affirmations.js');
const LOG_PATH = path.join(__dirname, '..', 'email_outbox.log');

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function logLinesBefore() {
  if (!fs.existsSync(LOG_PATH)) return 0;
  return fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n').filter(Boolean).length;
}

function lastLogLine() {
  if (!fs.existsSync(LOG_PATH)) return null;
  const lines = fs.readFileSync(LOG_PATH, 'utf8').trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  try { return JSON.parse(lines[lines.length - 1]); } catch { return null; }
}

// ── Synthetic user ────────────────────────────────────────────────────────────

const syntheticProfile = {
  user_id: 9999,
  email: 'test-daily-aff@empress-health-test.invalid',
  firstName: 'Synthia',
  stage: 'perimenopause',
  priorityCategorySlugs: [
    'vasomotor-temperature',
    'sleep-architecture-cortisol',
    'mood-anxiety-emotional-health',
  ],
  topConcernDomainIds: [],
  mhtActive: false,
  age: 47,
  timezone: 'UTC',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\n=== test-daily-affirmations ===\n');

// Clean up leftover test subscribers from prior runs
const SUBS_FILE = path.join(__dirname, '..', 'data', 'affirmation-subscribers.json');
if (fs.existsSync(SUBS_FILE)) {
  try {
    const existing = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    const cleaned = existing.filter((s) => s.email !== syntheticProfile.email);
    fs.writeFileSync(SUBS_FILE, JSON.stringify(cleaned, null, 2));
  } catch (_) {}
}

// ── Test 1: subscribe ─────────────────────────────────────────────────────────
console.log('Test 1: subscribe()');
let subscriberId;
let unsubscribeToken;
try {
  const result = await da.subscribe(syntheticProfile);
  subscriberId = result.subscriberId;
  unsubscribeToken = result.unsubscribeToken;

  assert(!!subscriberId, 'subscriberId returned');
  assert(
    new Date(result.nextSendAt) > new Date(),
    'nextSendAt is in the future',
    `got ${result.nextSendAt}`
  );
  assert(typeof unsubscribeToken === 'string' && unsubscribeToken.length >= 32,
    'unsubscribeToken is a 64-char hex string');
} catch (err) {
  console.error('  ERROR in subscribe:', err.message);
  failed += 3;
}

// ── Test 2: sendNextAffirmation — first send ──────────────────────────────────
console.log('\nTest 2: sendNextAffirmation() — first send');
let firstFocusDomain;
let linesBefore;
try {
  linesBefore = logLinesBefore();
  const result = await da.sendNextAffirmation(subscriberId);

  assert(result.sent === true, 'sent === true');
  assert(
    Array.isArray(result.affirmation?.evidence_refs) && result.affirmation.evidence_refs.length > 0,
    'affirmation has evidence_refs (grounded)',
    JSON.stringify(result.affirmation?.evidence_refs)
  );
  assert(typeof result.messageId === 'string' && result.messageId.length > 0,
    'messageId returned');

  firstFocusDomain = result.affirmation?.focus_domain;

  // Check log file got a new line
  const linesAfter = logLinesBefore();
  assert(linesAfter === linesBefore + 1, 'email_outbox.log got a new line',
    `before=${linesBefore} after=${linesAfter}`);

  const logLine = lastLogLine();
  assert(logLine?.to === syntheticProfile.email, 'log line has correct to:',
    `got ${logLine?.to}`);
  assert(typeof logLine?.subject === 'string' && logLine.subject.includes('Empress'),
    'log line subject contains "Empress"');

} catch (err) {
  console.error('  ERROR in sendNextAffirmation (first):', err.message);
  failed += 6;
}

// ── Test 3: second send — focus_domain should rotate ────────────────────────
console.log('\nTest 3: sendNextAffirmation() — focus_domain rotates on second send');
try {
  // Force next_send_at into the past so the second send is "due"
  // Do this by directly patching the file
  if (fs.existsSync(SUBS_FILE)) {
    const recs = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    for (const r of recs) {
      if (r.id === subscriberId) {
        r.next_send_at = new Date(Date.now() - 1000).toISOString();
      }
    }
    fs.writeFileSync(SUBS_FILE, JSON.stringify(recs, null, 2));
  }

  const result2 = await da.sendNextAffirmation(subscriberId);
  const secondFocusDomain = result2.affirmation?.focus_domain;

  assert(result2.sent === true, 'second send: sent === true');

  // The domain should rotate to the next slug in the priority list
  const slugs = syntheticProfile.priorityCategorySlugs;
  const expectedNextIdx = (slugs.indexOf(firstFocusDomain) + 1) % slugs.length;
  const expectedDomain  = slugs[expectedNextIdx];

  assert(
    secondFocusDomain === expectedDomain,
    `focus_domain rotated: ${firstFocusDomain} → ${secondFocusDomain} (expected ${expectedDomain})`
  );
} catch (err) {
  console.error('  ERROR in sendNextAffirmation (second):', err.message);
  failed += 2;
}

// ── Test 4: unsubscribe ──────────────────────────────────────────────────────
console.log('\nTest 4: unsubscribe()');
try {
  const result = await da.unsubscribe(unsubscribeToken);
  assert(result.ok === true, 'unsubscribe returns ok=true');

  // listDueSubscribers should no longer include this subscriber
  // Patch next_send_at to past to confirm it's still excluded
  if (fs.existsSync(SUBS_FILE)) {
    const recs = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    for (const r of recs) {
      if (r.id === subscriberId) {
        r.next_send_at = new Date(Date.now() - 1000).toISOString();
      }
    }
    fs.writeFileSync(SUBS_FILE, JSON.stringify(recs, null, 2));
  }

  const due = await da.listDueSubscribers();
  const stillPresent = due.some((s) => s.subscriberId === subscriberId);
  assert(!stillPresent, 'unsubscribed user not in listDueSubscribers()');
} catch (err) {
  console.error('  ERROR in unsubscribe:', err.message);
  failed += 2;
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
