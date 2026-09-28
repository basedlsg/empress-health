'use strict';

/**
 * lib/access-codes.js — Paid-tier access codes
 *
 * Mints a one-time-generated code that unlocks the paid 120-question
 * assessment (req.session.tierPaid = true) without going through the
 * as-yet-unbuilt Stripe checkout. Used to hand a specific person (a
 * purchaser once real payment lands, or a reviewer today) a code by email.
 *
 * Storage: pg pool when available (injected via setPool()), else an
 * in-memory Map — mirrors lib/daily-affirmations.js's fallback pattern so
 * local/no-DB dev still works, but production (Neon Postgres) persists
 * codes across serverless invocations.
 */

const crypto = require('crypto');

let _pool = null;
let _tableReady = false;
const _memoryCodes = new Map(); // code -> row, used only when no pool is injected

function setPool(pool) {
  _pool = pool;
}

async function _ensureTable() {
  if (!_pool || _tableReady) return;
  await _pool.query(`
    CREATE TABLE IF NOT EXISTS access_codes (
      code VARCHAR(16) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      plan VARCHAR(20) NOT NULL DEFAULT 'annual',
      note VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      redeemed_at TIMESTAMP,
      redeemed_count INTEGER DEFAULT 0
    );
  `);
  _tableReady = true;
}

// Unambiguous alphabet — excludes 0/O/1/I so a spoken/typed code is unambiguous.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function _generateCode() {
  let out = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    if (i === 4) out += '-';
  }
  return out;
}

/**
 * issueCode({ email, plan, note }) → Promise<{ code, email, plan }>
 * Generates a fresh code and persists it.
 */
async function issueCode({ email, plan = 'annual', note = '' } = {}) {
  if (!email || typeof email !== 'string') {
    throw new Error('issueCode: email is required.');
  }
  const code = _generateCode();
  const row = { code, email: email.trim().toLowerCase(), plan, note: String(note || '').slice(0, 255), created_at: new Date().toISOString(), redeemed_at: null, redeemed_count: 0 };

  if (_pool) {
    await _ensureTable();
    await _pool.query(
      `INSERT INTO access_codes (code, email, plan, note) VALUES ($1, $2, $3, $4)`,
      [row.code, row.email, row.plan, row.note]
    );
  } else {
    _memoryCodes.set(code, row);
  }
  return { code, email: row.email, plan: row.plan };
}

/**
 * redeemCode(code) → Promise<{ valid: boolean, plan?: string }>
 * Codes are reusable (mirrors the existing static PROMO_CODES behaviour) —
 * redemption just records a timestamp/count for visibility, it doesn't
 * invalidate the code.
 */
async function redeemCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { valid: false };

  if (_pool) {
    await _ensureTable();
    const result = await _pool.query(`SELECT * FROM access_codes WHERE code = $1`, [code]);
    const row = result.rows[0];
    if (!row) return { valid: false };
    await _pool.query(
      `UPDATE access_codes SET redeemed_at = NOW(), redeemed_count = redeemed_count + 1 WHERE code = $1`,
      [code]
    );
    return { valid: true, plan: row.plan };
  }

  const row = _memoryCodes.get(code);
  if (!row) return { valid: false };
  row.redeemed_at = new Date().toISOString();
  row.redeemed_count = (row.redeemed_count || 0) + 1;
  return { valid: true, plan: row.plan };
}

module.exports = { setPool, issueCode, redeemCode };
