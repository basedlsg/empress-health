'use strict';

/**
 * Double-submit-cookie CSRF protection (no external deps).
 *
 * Pattern:
 *  1. Server issues a random 32-byte hex token via issueCsrfToken().
 *     - Stored in req.session.csrfToken (httpOnly session cookie — server-side only).
 *     - ALSO set as a JS-readable cookie `csrf_token` (httpOnly:false) so the
 *       browser can read it and attach it to subsequent requests.
 *  2. Clients send the token back via the X-CSRF-Token header (or _csrf body field).
 *  3. verifyCsrfMiddleware() compares both values with timingSafeEqual.
 *
 * Exemptions (called before a session exists):
 *  - GET / HEAD / OPTIONS (safe methods)
 *  - /api/signup  — pre-session
 *  - /api/login   — pre-session
 *  - /qa          — public chatbot
 */

const crypto = require('crypto');

/** Routes exempt from CSRF enforcement (state-mutating requests only). */
const EXEMPT_PATHS = new Set(['/api/signup', '/api/login', '/qa', '/api/affirmations/unsubscribe']);

/** Safe HTTP methods that carry no state-mutation risk. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Issue (or refresh) a CSRF token for the current session.
 * Sets both the session value and the readable `csrf_token` cookie.
 * Returns the token string.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {string}
 */
function issueCsrfToken(req, res) {
  const token = crypto.randomBytes(32).toString('hex');

  // Store in session (server-side, not directly accessible by JS).
  if (req.session) {
    req.session.csrfToken = token;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Set a JS-readable cookie so the frontend can pick it up.
  res.cookie('csrf_token', token, {
    httpOnly: false,           // must be readable by JS
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    // No maxAge → session cookie; it will be refreshed whenever the session
    // regenerates (login / signup).
  });

  return token;
}

/**
 * Express middleware that enforces CSRF token validation on
 * state-mutating requests (POST, PUT, DELETE, PATCH).
 *
 * Must be mounted AFTER session middleware.
 */
function verifyCsrfMiddleware(req, res, next) {
  // Safe methods and exempt routes pass through immediately.
  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();

  // Also accept prefix-matched exemptions (e.g. /api/login?foo=bar).
  for (const exempt of EXEMPT_PATHS) {
    if (req.path.startsWith(exempt)) return next();
  }

  // Read token from header first, then body fallback.
  const headerToken = req.headers['x-csrf-token'];
  const bodyToken   = req.body && req.body._csrf;
  const clientToken = headerToken || bodyToken;

  const sessionToken = req.session && req.session.csrfToken;

  if (!clientToken || !sessionToken) {
    return res.status(403).json({ error: 'CSRF token invalid or missing' });
  }

  // Constant-time comparison to resist timing attacks.
  let valid = false;
  try {
    const a = Buffer.from(clientToken, 'utf8');
    const b = Buffer.from(sessionToken, 'utf8');
    // timingSafeEqual requires same length buffers.
    if (a.length === b.length) {
      valid = crypto.timingSafeEqual(a, b);
    }
  } catch (_) {
    valid = false;
  }

  if (!valid) {
    return res.status(403).json({ error: 'CSRF token invalid or missing' });
  }

  return next();
}

module.exports = { issueCsrfToken, verifyCsrfMiddleware, EXEMPT_PATHS };
