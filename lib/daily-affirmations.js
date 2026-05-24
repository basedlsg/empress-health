'use strict';

/**
 * lib/daily-affirmations.js — Daily personalised affirmation scheduler
 *
 * Storage: pg pool when available (injected via setPool()), else JSON file fallback.
 * Scheduler: runs every hour (configurable), picks due subscribers, sends serially.
 */

const fs   = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const { generateAffirmations } = require('./affirmations');
const { sendEmail }             = require('./email-sender');

const SUBSCRIBERS_FILE = path.join(__dirname, '..', 'data', 'affirmation-subscribers.json');
const BASE_URL = (process.env.RENDER_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

// ── Pool injection (avoids circular require with server.js) ──────────────────
let _pool = null;

/**
 * Inject the pg Pool instance from server.js.
 * Call this once at boot: dailyAffirmations.setPool(pool)
 */
function setPool(pool) {
  _pool = pool;
}

// ── DDL — run once at first use ──────────────────────────────────────────────
let _tableReady = false;

async function ensureTable() {
  if (!_pool || _tableReady) return;
  await _pool.query(`
    CREATE TABLE IF NOT EXISTS daily_affirmation_subscribers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      profile_json JSONB NOT NULL,
      cadence VARCHAR(32) NOT NULL DEFAULT 'daily',
      next_send_at TIMESTAMP NOT NULL,
      unsubscribe_token VARCHAR(64) NOT NULL UNIQUE,
      last_focus_domain VARCHAR(255),
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await _pool.query(`
    CREATE INDEX IF NOT EXISTS idx_daily_aff_due
      ON daily_affirmation_subscribers (active, next_send_at);
  `);
  _tableReady = true;
}

// ─── File-based storage helpers ──────────────────────────────────────────────

function fileRead() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[daily-affirmations] Failed to read subscribers file:', e.message);
    return [];
  }
}

function fileWrite(records) {
  const tmp = SUBSCRIBERS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2), 'utf8');
  fs.renameSync(tmp, SUBSCRIBERS_FILE);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function makeToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate next send time at 09:00 local timezone (default UTC).
 * Always returns a future timestamp.
 */
function nextSendTime(tz = 'UTC') {
  const now = new Date();

  // Build "today at 09:00" in the subscriber's timezone
  const todayAt9 = new Date(
    new Date().toLocaleString('en-US', { timeZone: tz })
  );
  todayAt9.setHours(9, 0, 0, 0);

  // Convert back to UTC by applying the offset difference
  const localNow = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  const offsetMs = now.getTime() - localNow.getTime();
  const nextUTC = new Date(todayAt9.getTime() + offsetMs);

  // If 09:00 already passed today, schedule for tomorrow
  if (nextUTC <= now) {
    nextUTC.setDate(nextUTC.getDate() + 1);
  }

  return nextUTC;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * subscribe(profile, options)
 *
 * profile: { user_id, email, firstName, stage, priorityCategorySlugs,
 *            topConcernDomainIds, mhtActive, age, timezone }
 */
async function subscribe(profile, { cadence = 'daily' } = {}) {
  if (!profile || !profile.email) throw new Error('profile.email is required');

  const tz = profile.timezone || 'UTC';
  const nextSendAt = nextSendTime(tz);
  const unsubscribeToken = makeToken();

  if (_pool) {
    await ensureTable();
    const result = await _pool.query(
      `INSERT INTO daily_affirmation_subscribers
         (user_id, email, profile_json, cadence, next_send_at, unsubscribe_token, active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (unsubscribe_token) DO NOTHING
       RETURNING id`,
      [
        profile.user_id || null,
        profile.email,
        JSON.stringify(profile),
        cadence,
        nextSendAt.toISOString(),
        unsubscribeToken,
      ]
    );

    const subscriberId = result.rows[0]?.id;
    console.log(`[daily-affirmations] Subscribed ${profile.email} (DB id=${subscriberId})`);
    return {
      subscriberId: String(subscriberId),
      nextSendAt: nextSendAt.toISOString(),
      unsubscribeToken,
    };
  }

  // File fallback
  const records = fileRead();
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  records.push({
    id,
    user_id: profile.user_id || null,
    email: profile.email,
    profile_json: profile,
    cadence,
    next_send_at: nextSendAt.toISOString(),
    unsubscribe_token: unsubscribeToken,
    last_focus_domain: null,
    active: true,
    created_at: new Date().toISOString(),
  });
  fileWrite(records);

  console.log(`[daily-affirmations] Subscribed ${profile.email} (file id=${id})`);
  return {
    subscriberId: id,
    nextSendAt: nextSendAt.toISOString(),
    unsubscribeToken,
  };
}

/**
 * unsubscribe(token) — mark subscriber inactive by token.
 */
async function unsubscribe(unsubscribeToken) {
  if (!unsubscribeToken) return { ok: false };

  if (_pool) {
    await ensureTable();
    const result = await _pool.query(
      `UPDATE daily_affirmation_subscribers
          SET active = FALSE
        WHERE unsubscribe_token = $1
       RETURNING id`,
      [unsubscribeToken]
    );
    const ok = result.rowCount > 0;
    if (ok) console.log(`[daily-affirmations] Unsubscribed token=${unsubscribeToken.slice(0, 8)}…`);
    return { ok };
  }

  // File fallback
  const records = fileRead();
  let ok = false;
  for (const r of records) {
    if (r.unsubscribe_token === unsubscribeToken && r.active) {
      r.active = false;
      ok = true;
    }
  }
  if (ok) fileWrite(records);
  return { ok };
}

/**
 * listDueSubscribers(now) — return all active subscribers whose next_send_at <= now.
 */
async function listDueSubscribers(now = new Date()) {
  if (_pool) {
    await ensureTable();
    const result = await _pool.query(
      `SELECT id, email, profile_json, next_send_at, last_focus_domain, unsubscribe_token
         FROM daily_affirmation_subscribers
        WHERE active = TRUE AND next_send_at <= $1
        ORDER BY next_send_at ASC`,
      [now.toISOString()]
    );
    return result.rows.map((row) => ({
      subscriberId: String(row.id),
      profile: row.profile_json,
      nextSendAt: row.next_send_at,
      lastFocusDomain: row.last_focus_domain,
      unsubscribeToken: row.unsubscribe_token,
    }));
  }

  const records = fileRead();
  const nowStr = now.toISOString();
  return records
    .filter((r) => r.active && r.next_send_at <= nowStr)
    .map((r) => ({
      subscriberId: r.id,
      profile: r.profile_json,
      nextSendAt: r.next_send_at,
      lastFocusDomain: r.last_focus_domain,
      unsubscribeToken: r.unsubscribe_token,
    }));
}

/**
 * getSubscriber(subscriberId) — fetch a single subscriber by id.
 */
async function getSubscriber(subscriberId) {
  if (_pool) {
    await ensureTable();
    const result = await _pool.query(
      `SELECT id, email, profile_json, next_send_at, last_focus_domain, unsubscribe_token, active
         FROM daily_affirmation_subscribers
        WHERE id = $1`,
      [subscriberId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      subscriberId: String(row.id),
      profile: row.profile_json,
      nextSendAt: row.next_send_at,
      lastFocusDomain: row.last_focus_domain,
      unsubscribeToken: row.unsubscribe_token,
      active: row.active,
    };
  }

  const records = fileRead();
  const r = records.find((x) => x.id === subscriberId);
  if (!r) return null;
  return {
    subscriberId: r.id,
    profile: r.profile_json,
    nextSendAt: r.next_send_at,
    lastFocusDomain: r.last_focus_domain,
    unsubscribeToken: r.unsubscribe_token,
    active: r.active,
  };
}

/**
 * getSubscriberByEmail(email) — fetch a single subscriber by email (file mode).
 */
async function getSubscriberByEmail(email) {
  if (_pool) {
    await ensureTable();
    const result = await _pool.query(
      `SELECT id, email, profile_json, next_send_at, unsubscribe_token, active
         FROM daily_affirmation_subscribers
        WHERE email = $1 AND active = TRUE
        ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      subscriberId: String(row.id),
      profile: row.profile_json,
      nextSendAt: row.next_send_at,
      unsubscribeToken: row.unsubscribe_token,
      active: row.active,
    };
  }

  const records = fileRead();
  const r = records.find((x) => x.email === email && x.active);
  if (!r) return null;
  return {
    subscriberId: r.id,
    profile: r.profile_json,
    nextSendAt: r.next_send_at,
    unsubscribeToken: r.unsubscribe_token,
    active: r.active,
  };
}

/**
 * Update next_send_at and last_focus_domain after a successful send.
 */
async function bumpSubscriber(subscriberId, nextSendAt, lastFocusDomain) {
  if (_pool) {
    await _pool.query(
      `UPDATE daily_affirmation_subscribers
          SET next_send_at = $1, last_focus_domain = $2
        WHERE id = $3`,
      [nextSendAt.toISOString(), lastFocusDomain, subscriberId]
    );
    return;
  }

  const records = fileRead();
  for (const r of records) {
    if (r.id === subscriberId) {
      r.next_send_at = nextSendAt.toISOString();
      r.last_focus_domain = lastFocusDomain;
    }
  }
  fileWrite(records);
}

// ─── Template renderer ───────────────────────────────────────────────────────

function renderEmail(subscriberRow, affirmation, citations, unsubscribeToken) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const profile  = subscriberRow.profile;
  const firstName = profile.firstName || 'there';
  const aff      = affirmation;
  const citation = citations[0];
  const snippet  = citation?.snippet || '';
  const whyLine  = snippet.length > 0 ? snippet.slice(0, 80) : '';
  const refs     = (aff.evidence_refs || []).join(', ') || 'clinical framework';
  const unsubUrl = `${BASE_URL}/api/affirmations/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const subject = `Your Empress affirmation for ${dateStr}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Empress Affirmation</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #fdf8f5; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .header { color: #6b2d5e; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 32px; }
    .affirmation { font-size: 22px; font-style: italic; color: #6b2d5e; line-height: 1.5; margin: 24px 0; border-left: 3px solid #c9a0c0; padding-left: 16px; }
    .why { font-size: 14px; color: #555; margin-top: 24px; }
    .why strong { color: #333; }
    .sources { font-size: 11px; color: #999; margin-top: 32px; border-top: 1px solid #e8e0e8; padding-top: 12px; }
    .unsub { font-size: 11px; color: #bbb; margin-top: 16px; }
    .unsub a { color: #bbb; }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="header">Empress Health &middot; Daily Affirmation</p>
    <p style="color:#333;font-size:15px;">Good morning, ${firstName}.</p>
    <div class="affirmation">&ldquo;${aff.text}&rdquo;</div>
    ${whyLine ? `<p class="why"><strong>Why this matters today:</strong> ${whyLine}</p>` : ''}
    <div class="sources">Sources: ${refs}</div>
    <div class="unsub"><a href="${unsubUrl}">Unsubscribe</a></div>
  </div>
</body>
</html>`;

  const text = [
    `Good morning, ${firstName}.`,
    '',
    `"${aff.text}"`,
    '',
    whyLine ? `Why this matters today: ${whyLine}` : '',
    '',
    `Sources: ${refs}`,
    '',
    `Unsubscribe: ${unsubUrl}`,
  ].filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n');

  return { subject, html, text };
}

// ─── Core send function ──────────────────────────────────────────────────────

/**
 * sendNextAffirmation(subscriberId)
 *
 * 1. Fetch subscriber
 * 2. Generate grounded affirmation (rotates focus_domain)
 * 3. Render + send email
 * 4. Bump next_send_at by 24h
 */
async function sendNextAffirmation(subscriberId) {
  const sub = await getSubscriber(subscriberId);
  if (!sub || !sub.active) {
    console.warn(`[daily-affirmations] Subscriber ${subscriberId} not found or inactive`);
    return { sent: false, affirmation: null, messageId: null };
  }

  const profile = sub.profile;
  const slugs   = profile.priorityCategorySlugs || [];

  // Pick next focus domain (rotate round-robin through priorities)
  let focusDomain;
  if (slugs.length > 0) {
    const lastIdx  = sub.lastFocusDomain ? slugs.indexOf(sub.lastFocusDomain) : -1;
    const nextIdx  = (lastIdx + 1) % slugs.length;
    focusDomain = slugs[nextIdx];
  } else {
    focusDomain = 'vasomotor-temperature';
  }

  // Generate affirmations
  let result;
  try {
    result = await generateAffirmations(profile, `aff-${subscriberId}`, {});
  } catch (err) {
    console.error(`[daily-affirmations] generateAffirmations failed for ${subscriberId}:`, err.message);
    return { sent: false, affirmation: null, messageId: null };
  }

  const { affirmations, citations } = result;

  // Pick the affirmation that best matches the rotated focus domain
  const picked =
    affirmations.find((a) => a.focus_domain === focusDomain) ||
    affirmations[0];

  if (!picked) {
    console.error(`[daily-affirmations] No affirmation returned for ${subscriberId}`);
    return { sent: false, affirmation: null, messageId: null };
  }

  // Render email
  const { subject, html, text } = renderEmail(sub, picked, citations, sub.unsubscribeToken);

  // Send
  let sendResult;
  try {
    sendResult = await sendEmail({
      to: sub.profile.email || profile.email,
      subject,
      html,
      text,
      unsubToken: sub.unsubscribeToken,
    });
  } catch (err) {
    console.error(`[daily-affirmations] sendEmail failed for ${subscriberId}:`, err.message);
    return { sent: false, affirmation: picked, messageId: null };
  }

  // Bump next_send_at by 24 hours
  const nextSendAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await bumpSubscriber(subscriberId, nextSendAt, picked.focus_domain);

  console.log(`[daily-affirmations] Sent to ${profile.email} (${sendResult.mode}) — focus: ${picked.focus_domain}`);

  return {
    sent: true,
    affirmation: picked,
    messageId: sendResult.messageId,
  };
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

let _schedulerInterval = null;

async function runSchedulerTick() {
  console.log('[daily-affirmations] Scheduler tick — checking due subscribers…');
  let due;
  try {
    due = await listDueSubscribers();
  } catch (err) {
    console.error('[daily-affirmations] listDueSubscribers error:', err.message);
    return;
  }

  console.log(`[daily-affirmations] ${due.length} subscriber(s) due`);

  // Serial — no parallelism to protect email-sender from burst
  for (const sub of due) {
    try {
      await sendNextAffirmation(sub.subscriberId);
    } catch (err) {
      console.error(`[daily-affirmations] Error sending to ${sub.subscriberId}:`, err.message);
    }
  }
}

/**
 * startScheduler({ intervalMs })
 * Idempotent — calling twice does not create two intervals.
 */
function startScheduler({ intervalMs = 60 * 60 * 1000 } = {}) {
  if (_schedulerInterval) return;
  console.log(`[daily-affirmations] Scheduler started (interval=${intervalMs}ms)`);
  _schedulerInterval = setInterval(() => {
    runSchedulerTick().catch((err) =>
      console.error('[daily-affirmations] Scheduler tick error:', err.message)
    );
  }, intervalMs);

  // Unref so the interval doesn't prevent process exit in test mode
  if (_schedulerInterval.unref) _schedulerInterval.unref();
}

function stopScheduler() {
  if (_schedulerInterval) {
    clearInterval(_schedulerInterval);
    _schedulerInterval = null;
    console.log('[daily-affirmations] Scheduler stopped');
  }
}

module.exports = {
  setPool,
  subscribe,
  unsubscribe,
  listDueSubscribers,
  sendNextAffirmation,
  getSubscriberByEmail,
  startScheduler,
  stopScheduler,
  // Exposed for test harness
  _runSchedulerTick: runSchedulerTick,
};
