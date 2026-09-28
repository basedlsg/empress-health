// lib/capture-store.js — durable storage for everything a visitor gives us.
//
// Tables (Postgres, created on first use):
//   email_captures         — every email entered anywhere on the site, with where
//   assessment_submissions — completed quizzes/assessments with scores + answers
//   contact_messages       — contact-form messages
//
// Before this, leads and messages went to JSONL files, which on Vercel are
// not persisted, so nothing was kept. Writes here are best-effort: a
// database hiccup is logged but never blocks the visitor's result.

"use strict";

let _getPool = () => null;
let _schemaReady = null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function configure({ getPool }) {
  _getPool = getPool;
}

function pool() {
  return _getPool();
}

function ensureSchema() {
  const p = pool();
  if (!p) return Promise.reject(new Error("No database configured"));
  if (!_schemaReady) {
    _schemaReady = p.query(`
      CREATE TABLE IF NOT EXISTS email_captures (
        id          BIGSERIAL PRIMARY KEY,
        email       VARCHAR(255) NOT NULL,
        first_name  VARCHAR(120),
        source      VARCHAR(60)  NOT NULL,
        user_id     INTEGER,
        context     JSONB,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS email_captures_email_idx ON email_captures (lower(email));
      CREATE INDEX IF NOT EXISTS email_captures_created_idx ON email_captures (created_at DESC);

      CREATE TABLE IF NOT EXISTS assessment_submissions (
        id          BIGSERIAL PRIMARY KEY,
        kind        VARCHAR(40)  NOT NULL,
        email       VARCHAR(255),
        first_name  VARCHAR(120),
        user_id     INTEGER,
        stage       VARCHAR(40),
        score       INTEGER,
        band        VARCHAR(60),
        scores      JSONB,
        responses   JSONB,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS assessment_submissions_user_idx ON assessment_submissions (user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS assessment_submissions_email_idx ON assessment_submissions (lower(email), created_at DESC);

      CREATE TABLE IF NOT EXISTS contact_messages (
        id          BIGSERIAL PRIMARY KEY,
        name        VARCHAR(120),
        email       VARCHAR(255) NOT NULL,
        phone       VARCHAR(40),
        message     TEXT NOT NULL,
        delivered   BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `).catch((err) => { _schemaReady = null; throw err; });
  }
  return _schemaReady;
}

function clip(value, max) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}

function jsonOrNull(value, maxChars = 100000) {
  if (value === undefined || value === null) return null;
  const s = JSON.stringify(value);
  return s.length > maxChars ? null : s;
}

/** Record an email. Returns true when stored. Never throws. */
async function captureEmail({ email, firstName, source, userId, context }) {
  const clean = clip(email, 255);
  if (!clean || !EMAIL_REGEX.test(clean) || !pool()) return false;
  try {
    await ensureSchema();
    await pool().query(
      `INSERT INTO email_captures (email, first_name, source, user_id, context)
       VALUES ($1, $2, $3, $4, $5)`,
      [clean.toLowerCase(), clip(firstName, 120), clip(source, 60) || "unknown",
       Number.isInteger(userId) ? userId : null, jsonOrNull(context, 20000)]
    );
    return true;
  } catch (err) {
    console.error(`[capture] email (${source}) not stored:`, err.message);
    return false;
  }
}

/** Record a completed quiz/assessment. Returns the new id or null. Never throws. */
async function saveSubmission({ kind, email, firstName, userId, stage, score, band, scores, responses }) {
  if (!pool()) return null;
  try {
    await ensureSchema();
    const n = Number(score);
    const r = await pool().query(
      `INSERT INTO assessment_submissions
         (kind, email, first_name, user_id, stage, score, band, scores, responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [clip(kind, 40) || "unknown",
       email && EMAIL_REGEX.test(String(email)) ? String(email).trim().toLowerCase().slice(0, 255) : null,
       clip(firstName, 120),
       Number.isInteger(userId) ? userId : null,
       clip(stage, 40),
       Number.isFinite(n) ? Math.round(n) : null,
       clip(band, 60),
       jsonOrNull(scores),
       jsonOrNull(responses)]
    );
    return r.rows[0].id;
  } catch (err) {
    console.error(`[capture] submission (${kind}) not stored:`, err.message);
    return null;
  }
}

/** Store a contact message; returns its id or null. Never throws. */
async function saveContactMessage({ name, email, phone, message }) {
  if (!pool()) return null;
  try {
    await ensureSchema();
    const r = await pool().query(
      `INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id`,
      [clip(name, 120), clip(email, 255), clip(phone, 40), String(message).slice(0, 5000)]
    );
    return r.rows[0].id;
  } catch (err) {
    console.error("[capture] contact message not stored:", err.message);
    return null;
  }
}

async function markContactDelivered(id) {
  if (!id || !pool()) return;
  try {
    await pool().query(`UPDATE contact_messages SET delivered = TRUE WHERE id = $1`, [id]);
  } catch (err) {
    console.error("[capture] contact delivered flag not set:", err.message);
  }
}

/**
 * A signed-in user's saved results, newest first. Linked by user_id only —
 * never by email: sign-up does not verify email ownership, so email matching
 * would let anyone register with another woman's address and read her answers.
 */
async function listSubmissionsForUser({ userId, limit = 10 }) {
  if (!pool()) return [];
  try {
    await ensureSchema();
    const r = await pool().query(
      `SELECT id, kind, stage, score, band, scores, created_at
         FROM assessment_submissions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [userId, limit]
    );
    return r.rows;
  } catch (err) {
    console.error("[capture] could not list submissions:", err.message);
    return [];
  }
}

module.exports = {
  configure,
  captureEmail,
  saveSubmission,
  saveContactMessage,
  markContactDelivered,
  listSubmissionsForUser,
};
