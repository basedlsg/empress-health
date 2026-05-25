// server.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config({ path: path.join(__dirname, ".env") });

const { generateAffirmations: _generateAffirmationsGrounded } = require("./lib/affirmations");
const { handleQA } = require("./lib/qa");
const retrieval = require("./lib/retrieval");
const { issueCsrfToken, verifyCsrfMiddleware } = require("./lib/csrf");
const dailyAffirmations = require("./lib/daily-affirmations");
// Init retrieval on startup (non-blocking; will auto-init on first call if missed)
retrieval.init().catch((err) => console.warn("[retrieval] Deferred init warning:", err.message));

/**
 * Validate that a redirect target is safe (local path only).
 * Accepts paths starting with "/" but rejects protocol-relative URLs (//),
 * absolute URLs (contain ":"), "@", or whitespace that browsers may interpret
 * as host-jumping. This blocks open-redirect attacks via ?next=.
 *
 * @param {string|undefined|null} value
 * @returns {boolean}
 */
function isSafeRedirectTarget(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (!value.startsWith('/'))     return false; // must be root-relative
  if (value.startsWith('//'))     return false; // protocol-relative URL
  if (value.includes(':'))        return false; // absolute URL / data URI
  if (value.includes('@'))        return false; // user-info component
  if (/\s/.test(value))           return false; // any whitespace
  return true;
}

const app = express();

process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

const PORT = process.env.PORT || 3000;
const FASTAPI_URL = (process.env.FASTAPI_URL || "http://localhost:8001").replace(/\/$/, "");
const FASTAPI_TIMEOUT_MS = Number(process.env.FASTAPI_TIMEOUT_MS || 15000);
const RENDER_BASE_URL = (process.env.RENDER_BASE_URL || "https://empress-health-backend.onrender.com").replace(/\/$/, "");
const MVP_AI_URL = (process.env.MVP_AI_URL || "http://localhost:8000").replace(/\/$/, "");
const RENDER_PROFILE_ME_PATH = "/api/v1/profile/me";

// PostgreSQL connection pool - with graceful error handling
let dbConnected = false;
let pool = null;
let sessionStore = undefined;

// Only create pool if database credentials are provided
if (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD) {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // DB_SSL=true enables TLS with full cert verification.
      // If your provider uses a self-signed cert, set PGSSLMODE=no-verify or supply a CA bundle.
      ssl: process.env.DB_SSL === 'true' ? true : false,
      // Add connection timeout and retry settings
      connectionTimeoutMillis: 10000, // 10 seconds
      idleTimeoutMillis: 30000,
      max: 10
    });

    sessionStore = new pgSession({ pool, createTableIfMissing: true });

    // Test database connection
    pool.on('connect', () => {
      console.log('✅ PostgreSQL connected');
      dbConnected = true;
    });

    pool.on('error', (err) => {
      console.error('❌ PostgreSQL pool error:', err.message);
      dbConnected = false;
    });

    // Initialize database table if it doesn't exist
    async function initDatabase() {
      try {
        // Test connection first with a simple query
        await pool.query('SELECT NOW()');

        // Create users table
        const createUsersTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(255),
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            is_profile_updated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `;
        await pool.query(createUsersTableQuery);
        await pool.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255) DEFAULT '' NOT NULL,
          ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
          ADD COLUMN IF NOT EXISTS is_profile_updated BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        `);
        console.log('✅ Users table initialized');

        // Create session table for connect-pg-simple (persistent sessions)
        await pool.query(`
          CREATE TABLE IF NOT EXISTS session (
            sid VARCHAR PRIMARY KEY NOT NULL,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
          );
        `);
        await pool.query(`
          CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
        `);
        console.log('✅ Session table initialized');

        // Create membership_surveys table with user_id foreign key
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS membership_surveys (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            age VARCHAR(255),
            energy_rating VARCHAR(255),
            exercise_frequency VARCHAR(255),
            exercise_type TEXT,
            diet_rating VARCHAR(255),
            dietary_restrictions TEXT,
            sleep_quality VARCHAR(255),
            stress_levels VARCHAR(255),
            medical_conditions TEXT,
            medications TEXT,
            allergies TEXT,
            primary_health_goal VARCHAR(255),
            approaches_interest TEXT,
            affirmations_inspire TEXT,
            symptoms_experiencing TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            ip_address VARCHAR(255)
          );
        `;
        await pool.query(createTableQuery);

        // Add user_id column if it doesn't exist (for existing tables)
        try {
          // First check if column exists
          const columnCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'membership_surveys' AND column_name = 'user_id';
          `);

          if (columnCheck.rows.length === 0) {
            // Column doesn't exist, add it as nullable first
            await pool.query(`
              ALTER TABLE membership_surveys 
              ADD COLUMN user_id INTEGER;
            `);

            // Check if there's existing data that might prevent adding the constraint
            const existingDataCheck = await pool.query(`
              SELECT COUNT(*) as count FROM membership_surveys WHERE user_id IS NOT NULL;
            `);

            const existingCount = parseInt(existingDataCheck.rows[0].count) || 0;

            // If no existing data with user_id, we can add the constraint
            // If there is data, we'll leave it without constraint (existing surveys won't have user_id)
            if (existingCount === 0) {
              try {
                await pool.query(`
                  ALTER TABLE membership_surveys 
                  ADD CONSTRAINT membership_surveys_user_id_fkey 
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                `);
              } catch (fkErr) {
                console.log('Note: Could not add foreign key constraint:', fkErr.message);
              }
            } else {
              console.log('Note: user_id column added without foreign key constraint due to existing data.');
            }
          } else {
            // Column exists, check if constraint exists
            const constraintCheck = await pool.query(`
              SELECT constraint_name 
              FROM information_schema.table_constraints 
              WHERE table_name = 'membership_surveys' 
              AND constraint_name = 'membership_surveys_user_id_fkey';
            `);

            if (constraintCheck.rows.length === 0) {
              // Column exists but no constraint, try to add it
              try {
                await pool.query(`
                  ALTER TABLE membership_surveys 
                  ADD CONSTRAINT membership_surveys_user_id_fkey 
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                `);
              } catch (fkErr) {
                console.log('Note: Could not add foreign key constraint to existing column:', fkErr.message);
              }
            }
          }
        } catch (alterErr) {
          // Column might already exist or other error - log but continue
          if (!alterErr.message.includes('already exists') && !alterErr.message.includes('duplicate')) {
            console.log('Note: Could not add user_id column:', alterErr.message);
          }
        }

        // Alter existing table if age column is INTEGER (for existing databases)
        try {
          await pool.query(`
            ALTER TABLE membership_surveys 
            ALTER COLUMN age TYPE VARCHAR(255);
          `);
        } catch (alterErr) {
          // Column might already be VARCHAR or table might not exist yet - ignore error
          if (!alterErr.message.includes('does not exist') && !alterErr.message.includes('type')) {
            console.log('Note: Could not alter age column type:', alterErr.message);
          }
        }
        console.log('✅ Database table initialized');
        dbConnected = true;
      } catch (err) {
        // Handle AggregateError and other connection errors
        const errorMessage = err.message || (err.errors && err.errors.map(e => e.message).join(', ')) || 'Unknown error';
        console.error('❌ Database initialization error:', errorMessage);

        // Check if it's a connection error
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.name === 'AggregateError' || err.constructor.name === 'AggregateError') {
          console.log('⚠️  Database connection failed - running in test mode');
          console.log('⚠️  Survey data will be logged to console only');
        } else {
          console.log('⚠️  Database error - running in test mode');
          console.log('⚠️  Survey data will be logged to console only');
        }
        dbConnected = false;
      }
    }

    // Initialize database with timeout
    Promise.race([
      initDatabase(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database initialization timeout')), 15000)
      )
    ]).catch(err => {
      console.error('❌ Database initialization timeout or error:', err.message);
      console.log('⚠️  Running in test mode - survey data will be logged only');
      dbConnected = false;
    });
  } catch (err) {
    console.error('❌ Failed to create database pool:', err.message);
    console.log('⚠️  Running in test mode - survey data will be logged only');
    dbConnected = false;
  }
} else {
  console.log('⚠️  No database credentials found - running in test mode');
  console.log('⚠️  Survey data will be logged to console only');
}

// Inject pg pool into daily-affirmations module (null-safe — module handles file fallback)
if (pool) {
  dailyAffirmations.setPool(pool);
}

// Parse JSON bodies for /api routes
app.set('trust proxy', 1);

// Parse cookies
app.use(cookieParser());

// Session configuration (persistent store when DB available, else MemoryStore)
const isProduction = process.env.NODE_ENV === 'production';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProduction) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  console.warn('⚠️  SESSION_SECRET not set — using insecure dev default');
}

app.use(session({
  store: sessionStore || undefined,
  secret: sessionSecret || 'dev-only-insecure-default',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matches the auth-token cookies)
  }
}));

// CSRF protection: validate double-submit cookie on all state-mutating requests.
// Exempt routes (/api/signup, /api/login, /qa) are whitelisted inside the middleware.
app.use(verifyCsrfMiddleware);

// Issue a fresh CSRF token — call this after login/signup or on page load.
// The client reads the `csrf_token` cookie and attaches it as X-CSRF-Token.
app.get("/api/csrf", (req, res) => {
  const token = issueCsrfToken(req, res);
  return res.json({ csrfToken: token });
});

// Serve /public at /public (e.g., /public/EmpressHealthlogo.png)
app.use("/public", express.static(path.join(__dirname, "public")));

// Paid report section banners (NumberedSectionHero / InterludeHero /
// LuxuryGiftHero in prds/reportDesignSystem.tsx). The React code requests
// /report-heroes/<slug>.{jpg,png,svg} directly (no /public prefix), so we
// mount the same folder at the unprefixed URL the components expect.
// Without this mount the fallback chain runs out of extensions and the
// section degrades to a heading-only layout.
app.use(
  "/report-heroes",
  express.static(path.join(__dirname, "public", "report-heroes"))
);

// Serve mock pages at /mockpages (e.g. /mockpages/mockdailyaffirmations.html)
app.use("/mockpages", express.static(path.join(__dirname, "mockpages")));

// Empress Naturals redesign bundle (from Claude Design): served at /pages/*.
// Contains styles.css, shared.jsx, and the 8 redesigned page HTML+JSX files.
// Each .html page loads React 18 + Babel via CDN and hydrates its sibling .jsx.
app.use("/pages", express.static(path.join(__dirname, "pages")));

// Peri+ assessment SPA (build: npm run build:assessment → prds/dist)
// Note: mounting express.static at "/assessment" caused Express 5 / serve-static to 302
// redirect "/assessment/" → "/assessment/" (infinite loop in browsers). Serve explicitly:
const assessmentDist = path.join(__dirname, "prds", "dist");
const assessmentIndex = path.join(assessmentDist, "index.html");
if (fs.existsSync(assessmentIndex)) {
  app.use(
    "/assessment/assets",
    express.static(path.join(assessmentDist, "assets"))
  );
  // Express 5 may normalize "/assessment/" to "/assessment". Do not redirect between
  // them — that caused a 302 loop (Location: /assessment/). Serve index for both.
  //
  // Auth gate: the PAID assessment calls /api/recommendations/affirmations/generate
  // and /api/recommendations/combined, which require an authenticated session.
  // The FREE Mini Assessment is self-contained (no API calls) and does not need
  // a session — its intro even advertises "No account required".
  //
  // Behavior:
  //   - ?tier=free         → TEMPORARILY DISABLED. Free Mini / 30-question
  //                          free assessment is hidden for now; redirect to
  //                          ?tier=paid. Remove this redirect to re-enable.
  //   - ?tier=paid         → serve SPA directly (free→paid upgrade must not
  //                          ricochet users back through /signup)
  //   - default (no tier)  → require session; otherwise bounce through /signup
  //                          and return them to /assessment/?tier=paid
  app.get(["/assessment", "/assessment/"], (req, res) => {
    const tier = req.query && typeof req.query.tier === "string" ? req.query.tier : null;

    // Free tier disabled: any ?tier=free traffic bounces to the paid flow.
    if (tier === "free") {
      return res.redirect(302, "/assessment/?tier=paid");
    }

    if (tier === "paid") {
      return res.sendFile(assessmentIndex);
    }

    if (!req.session || !req.session.userId) {
      const rawNext = req.originalUrl && req.originalUrl.startsWith("/assessment")
        ? req.originalUrl
        : "/assessment/?tier=paid";
      // Validate the next target to prevent open-redirect attacks.
      const next = isSafeRedirectTarget(rawNext) ? rawNext : "/assessment/?tier=paid";
      console.log("[assessment gate] no session, redirecting via signup ->", next);
      return res.redirect("/signup?next=" + encodeURIComponent(next));
    }
    res.sendFile(assessmentIndex);
  });
} else {
  console.warn(
    "⚠️  Assessment SPA not built (missing prds/dist). Run: npm run build:assessment"
  );
  app.get(["/assessment", "/assessment/"], (_req, res) => {
    res
      .status(503)
      .type("html")
      .send(
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Assessment unavailable</title></head><body style='font-family:system-ui;padding:2rem'>" +
        "<h1>Assessment unavailable</h1>" +
        "<p>The build output <code>prds/dist</code> is missing. From the project root run:</p>" +
        "<pre style='background:#f4f4f4;padding:1rem'>npm run build:assessment</pre>" +
        "<p>Then restart the server (or use <code>npm start</code>, which runs a prestart build when dist is missing).</p>" +
        "</body></html>"
      );
  });
}

/*----------------------Ask Empress Chat----------------------------------*/



// ✅ Allow only your sites
const allowedOrigins = [
  "https://empressnaturals.co",
  "https://www.empressnaturals.co",
  "http://localhost:3000",
  "https://empress-t348.onrender.com",
  "https://empress-mvp.onrender.com/qa",
  "https://empress-health-site.onrender.com",
  "https://empress-mvp-ai.onrender.com/qa",
  "https://empress-health-backend.onrender.com/",
  "https://empresshealth.ai",
  "https://empress-health-ai.onrender.com/"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

// Auth rate limiter: 10 requests per 15 minutes on login/signup
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "Too many login attempts. Please try again in 15 minutes.",
      retryAfter: 900
    });
  }
});

// Helper: strip secrets from objects before logging
function redactSecrets(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const REDACTED_KEYS = new Set(['token', 'access_token', 'auth_token', 'accessToken', 'password', 'hashed_password']);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = redactSecrets(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Contact form rate limiter: 5 requests per 10 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "Too many contact form submissions. Please wait 10 minutes.",
      retryAfter: 600
    });
  }
});

// Zapier contact webhook URL — read once at startup (avoids reading env per-request).
const ZAPIER_CONTACT_WEBHOOK_URL = process.env.ZAPIER_CONTACT_WEBHOOK_URL || '';
if (!ZAPIER_CONTACT_WEBHOOK_URL) {
  console.warn('[contact] ZAPIER_CONTACT_WEBHOOK_URL not set — /api/contact will return 503');
}

// Rate limit /api/chat — relaxed so normal use doesn't hit 429; clear body for monitoring
const chatLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded for chat. Try again in a minute.",
      retryAfter: 60
    });
  }
});
app.use("/api/chat", chatLimiter);

// Rate limit /api/shopify — proxies the Storefront GraphQL token, so abusive
// volume from a single authenticated user would still burn the token's quota.
const shopifyLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    error: "Too many requests",
    message: "Rate limit exceeded for Shopify proxy. Try again in a minute.",
    retryAfter: 60
  })
});
app.use("/api/shopify", shopifyLimiter);

// ✅ Simple server-side history cap/summarize hook
function trimHistory(messages, maxTurns = 10) {
  // keep system + last N pairs
  const system = messages.filter(m => m.role === "system").slice(0, 1);
  const rest = messages.filter(m => m.role !== "system");
  const kept = rest.slice(-maxTurns);
  return [...system, ...kept];
}

app.post("/api/chat", async (req, res) => {
  try {
    // Accept both shapes: { message } or { query }
    const raw =
      (typeof req.body?.message === "string" ? req.body.message :
        typeof req.body?.query === "string" ? req.body.query :
          "");

    const user = raw.trim();
    if (!user) {
      return res.status(400).json({ error: "message required" });
    }

    // Optional: timeout (prevents a hanging request)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s

    const upstream = await fetch("https://empress-mvp-ai.onrender.com/qa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Keep if your upstream requires it; otherwise you can remove
        "Authorization": `Bearer ${process.env.EMPRESS_CHAT_SECRET || ""}`
      },
      body: JSON.stringify({ query: user }),
      signal: controller.signal
    }).catch(err => {
      // fetch throws on abort; surface a clean error
      throw new Error(`Upstream fetch failed: ${err.message}`);
    });
    clearTimeout(timeout);

    // Handle non-200s with diagnostic text
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("Upstream error:", upstream.status, text);
      return res
        .status(upstream.status)
        .json({ error: "Upstream failed", detail: text || `status ${upstream.status}` });
    }

    // Be tolerant to either JSON or text
    const rawText = await upstream.text();
    let data;
    try { data = JSON.parse(rawText); } catch { data = { response: rawText }; }

    // Normalize shape so your frontend can always do data.response
    const response =
      data?.response ?? data?.answer ?? data?.message ?? "…";

    return res.json({ response });
  } catch (err) {
    console.error("API /api/chat error:", err);
    const msg = err?.message?.includes("aborted") ? "Upstream timeout" : "Internal server error";
    return res.status(500).json({ error: msg });
  }
});


/*app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ response: "Message is required", count: 0 });
    }

    // Default payload we'll always return
    let data = { response: "Sorry, could not get a response from AI.", count: 0 };

    // Timeout setup (15s)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 40000);

    let upstream;
    try {
      upstream = await fetch("https://empress-mvp-ai.onrender.com/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({ query: message }),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(t);
      if (err.name === "AbortError") {
        return res.status(504).json({ response: "AI server timed out. Please try again.", count: 0 });
      }
      console.error("Network error to upstream:", err);
      return res.status(502).json({ response: "Upstream unreachable.", count: 0 });
    }

    clearTimeout(t);

    const contentType = upstream.headers.get("content-type") || "";
    const status = upstream.status;
    const raw = await upstream.text(); // read once

    if (!raw.trim()) {
      // Upstream returned nothing (common with crash/500)
      console.error("Empty response from upstream. Status:", status);
      return res.status(502).json({ response: "Upstream returned empty response.", count: 0 });
    }

    let parsed;
    if (contentType.includes("application/json")) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error("Invalid JSON from upstream:", e, "First 200 chars:", raw.slice(0, 200));
        return res.status(502).json({ response: "Invalid JSON from upstream.", count: 0 });
      }
    } else {
      // Fallback: upstream sent text/HTML (e.g., platform error page)
      console.warn("Non-JSON upstream response. content-type:", contentType, "status:", status);
      // Optionally surface a sanitized snippet to help debug
      return res.status(502).json({
        response: `Upstream error (status ${status}).`,
        count: 0
      });
    }

    if (!upstream.ok) {
      // Upstream gave JSON but with an error status
      const errMsg = parsed?.error || parsed?.message || `HTTP ${status}`;
      return res.status(502).json({ response: `Upstream error: ${errMsg}`, count: 0 });
    }

    // Success path
    data.response = parsed.response || parsed.answer || "Sorry, no response";
    data.count = parsed.retrieved_documents_count ?? parsed.count ?? 0;
    return res.status(200).json(data);

  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ response: "Internal server error", count: 0 });
  }
});*/



/*----------------------Ask Empress Chat----------------------------------*/

/**
 * Thin OpenAI caller injected into handleQA.
 * Separated so tests can mock it without patching fetch.
 */
async function _callOpenAIChat(systemPrompt, userQuery, signal) {
  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userQuery },
    ],
  };

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal,
  });

  const text = await upstream.text();
  let data;
  try { data = JSON.parse(text); } catch { data = {}; }

  if (!upstream.ok) {
    const msg = data?.error?.message || text || `OpenAI error ${upstream.status}`;
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return content;
}

app.post("/qa", async (req, res) => {
  const requestId = `qa-${Date.now().toString(36)}`;
  try {
    const rawQuery = String(req.body.query || "").trim();
    if (!rawQuery) return res.status(400).json({ response: "Ask a question to get started." });

    // Redact secrets from the stored/logged query
    const safeQuery = redactSecrets({ query: rawQuery }).query;

    const result = await handleQA({
      query: safeQuery,
      callOpenAI: _callOpenAIChat,
      requestId,
    });

    // Emit both new shape and legacy `response` field for backward compat
    res.json({
      response: result.answer,  // legacy field consumed by existing frontend
      answer:   result.answer,
      sources:  result.sources,
    });
  } catch (err) {
    console.error(`[${requestId}] Server exception in /qa:`, err.message);
    res.status(500).json({ response: "Server error generating answer." });
  }
});


/* -------------------- Groq API Helper Functions -------------------- */

/**
 * Call Groq API with a prompt and return the response
 * @param {string} systemPrompt - System prompt for the LLM
 * @param {string} userPrompt - User prompt/question
 * @param {string} requestId - Request ID for logging
 * @returns {Promise<string>} - The LLM response content
 */
async function callGroqAPI(systemPrompt, userPrompt, requestId = '') {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const payload = {
    model: "llama-3.1-70b-versatile", // Fast, free tier model
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" } // Request JSON response
  };

  const startTime = Date.now();
  const groqCtrl = new AbortController();
  const groqTimeout = setTimeout(() => groqCtrl.abort(), 20000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`
      },
      body: JSON.stringify(payload),
      signal: groqCtrl.signal
    });

    const duration = Date.now() - startTime;
    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error(`[${requestId}] ❌ Groq API response parsing error:`, parseErr.message);
      console.error(`[${requestId}]   Response text:`, text.substring(0, 500));
      throw new Error(`Invalid JSON response from Groq API: ${parseErr.message}`);
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || text || `Groq API error ${response.status}`;
      console.error(`[${requestId}] ❌ Groq API error (${duration}ms):`, errorMsg);
      throw new Error(`Groq API error: ${errorMsg}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error(`[${requestId}] ❌ Groq API returned no content:`, data);
      throw new Error("Groq API returned no content");
    }

    console.log(`[${requestId}] ✅ Groq API call successful (${duration}ms)`);
    return content;

  } catch (err) {
    const duration = Date.now() - startTime;
    if (err.message.includes('Groq API')) {
      throw err; // Re-throw Groq-specific errors
    }
    console.error(`[${requestId}] ❌ Groq API request failed (${duration}ms):`, err.message);
    throw new Error(`Failed to call Groq API: ${err.message}`);
  } finally {
    clearTimeout(groqTimeout);
  }
}

/**
 * Generate affirmations — delegates to lib/affirmations.js for retrieval-grounded output.
 *
 * Accepts extended userProfile fields:
 *   priorityCategorySlugs: string[]  — top 3 lowest-scoring categories
 *   topConcernDomainIds:   number[]  — top 3 lowest-scoring domains
 *   mhtActive:             boolean
 *   stage:                 string    — "perimenopause"|"menopause"|"post_menopause"
 * Legacy fields (health_goal, symptoms, approaches, stress_level) are still accepted.
 *
 * Returns the full structured result from lib/affirmations; callers that need
 * only the legacy string array should access .legacyStrings.
 *
 * @param {object} userProfile
 * @param {string} requestId
 * @returns {Promise<{ affirmations, citations, legacyStrings }>}
 */
async function generateAffirmations(userProfile, requestId) {
  return _generateAffirmationsGrounded(userProfile, requestId, { callGroqAPI });
}

/**
 * generateRecommendations — catalog-backed, hallucination-free.
 *
 * Products come exclusively from data/product_catalog.json.
 * The LLM (Groq) is used ONLY to write a ≤60-word personalised reason
 * sentence; its evidence_refs output is validated against the retrieved
 * chunk IDs so no invented IDs can leak through.
 *
 * @param {object} userProfile
 *   priorityCategorySlugs  string[]  — lowest-scoring category slugs (pain points)
 *   urgentItemFlags        Array     — e.g. [{question:99}] or [99]
 *   stage                  string    — "perimenopause"|"menopause"|"post_menopause"
 *   mhtActive              boolean
 *   age                    number
 * @param {string} requestId
 * @returns {Promise<{ recommendations: object[], clinician: object|null }>}
 */
async function generateRecommendations(userProfile, requestId) {
  const catalog   = require("./lib/catalog");
  const retrieval = require("./lib/retrieval");

  const stage              = userProfile?.stage || "perimenopause";
  const mhtActive          = userProfile?.mhtActive || false;
  const age                = Number(userProfile?.age || 0);
  const urgentItemFlags    = Array.isArray(userProfile?.urgentItemFlags) ? userProfile.urgentItemFlags : [];
  const priorityCategories = Array.isArray(userProfile?.priorityCategorySlugs)
    ? userProfile.priorityCategorySlugs
    : [];

  // ── 1. Derive priority domain IDs from category slugs ────────────────────
  const CATEGORY_TO_DOMAIN = {
    "vasomotor-temperature":             1,
    "sleep-architecture-cortisol":       2,
    "cognitive-function-brain-health":   3,
    "mood-anxiety-emotional-health":     4,
    "metabolic-health-body-composition": 5,
    "skin-hair-nails":                   6,
    "musculoskeletal-bone-health":       7,
    "genitourinary-sexual-health":       8,
    "cardiovascular-whole-body-energy":  9,
    "lifestyle-gut-health-nutrition":    10,
    "stress-resilience-life-load":       4,
  };
  const priorityDomainIds = [...new Set(
    priorityCategories.map((s) => CATEGORY_TO_DOMAIN[s]).filter(Boolean)
  )];

  // ── 2. Get curated products from catalog ─────────────────────────────────
  const userContext = { stage, mhtActive, age, urgent_flags: urgentItemFlags };
  let productMatches = await catalog.getProductsForUser({
    priorityCategories,
    userContext,
    k: 5,
  });

  // Fallback: no category match → top 5 essentials for this stage
  if (productMatches.length === 0) {
    productMatches = catalog.getAllProducts()
      .filter((p) => p.stage_relevance.includes(stage) && p.price_tier === "essential")
      .slice(0, 5)
      .map((p) => ({ ...p, match_reason: p.blurb, retrieval_score: 0 }));
  }

  // ── 3. Get curated clinician (urgent flags → domain overlap → NAMS MSCP) ─
  const clinicianEntry = await catalog.getClinicianForUser({
    urgentItemFlags,
    priorityDomainIds,
    stage,
  });

  // ── 4. Personalise each product reason via Groq (optional, validated) ────
  await retrieval.init();

  const recommendations = await Promise.all(
    productMatches.map(async (prod) => {
      const query = [
        priorityCategories.join(" "),
        ...(prod.clinical_topics || []),
      ].join(" ");

      let retrievedContext = { context: "", citations: [] };
      try {
        retrievedContext = await retrieval.retrieveContext({
          query,
          k: 2,
          filter: {},
          maxChars: 800,
        });
      } catch (_err) {
        // Non-fatal — fall back to static blurb
      }

      const retrievedIds = new Set(retrievedContext.citations.map((c) => c.id));

      let reason       = prod.blurb;
      let evidenceRefs = prod.evidence_refs.slice();

      if (retrievedContext.context && process.env.GROQ_API_KEY) {
        const sysPrompt = `You are a women's health content writer. Write only the personalised reason text. Cite no products outside the provided list. Do NOT invent product names, dosages, or brand names. Reference the clinical context provided to ground your reason. Output JSON: {"reason": "...", "evidence_refs": ["chunk-id-1", "chunk-id-2"]}`;
        const llmUserPrompt = `Clinical context:\n${retrievedContext.context}\n\nProduct: ${prod.name}\nUser stage: ${stage}, priority areas: ${priorityCategories.join(", ")}\n\nWrite a personalised reason (under 60 words) for why this product is relevant for this user. Include the 1-2 most relevant chunk IDs from the context above as evidence_refs.`;

        try {
          const raw    = await callGroqAPI(sysPrompt, llmUserPrompt, requestId);
          const parsed = JSON.parse(raw);
          if (parsed.reason && typeof parsed.reason === "string") {
            reason = parsed.reason.trim();
            // Validate: only accept evidence_refs that existed in retrieved context
            const validated = Array.isArray(parsed.evidence_refs)
              ? parsed.evidence_refs.filter((id) => retrievedIds.has(id))
              : [];
            if (validated.length > 0) {
              evidenceRefs = validated;
            }
            // If LLM hallucinated IDs, static refs are used silently
          }
        } catch (_llmErr) {
          // Non-fatal — use blurb as reason
        }
      }

      return {
        product_id:     prod.id,
        product_name:   prod.name,
        shopify_handle: prod.shopify_handle || null,
        price_tier:     prod.price_tier,
        reason,
        evidence_refs:  evidenceRefs,
      };
    })
  );

  // ── 5. Build clinician response ───────────────────────────────────────────
  let clinician = null;
  if (clinicianEntry) {
    clinician = {
      specialty_id:      clinicianEntry.id,
      label:             clinicianEntry.label,
      abbreviation:      clinicianEntry.abbreviation,
      reason:            clinicianEntry.when_to_refer,
      find_provider_url: clinicianEntry.find_provider_url,
      evidence_refs:     clinicianEntry.evidence_refs || [],
    };
  }

  return { recommendations, clinician };
}


/* -------------------- API: Shopify proxy (secure) -------------------- */

// Quick connectivity check — returns minimal status only to avoid info leaks
app.get("/api/health", (_req, res) => {
  res.json({ status: 'ok' });
});

// Echo products for a specific collection handle (log-only helper — disabled in production)
app.get("/api/debug/collection/:handle", async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  try {
    const r = await fetch(`https://${process.env.SHOP_DOMAIN}/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: `
          query($handle:String!) {
            collection(handle:$handle) {
              title
              products(first: 50) { edges { node { id title handle onlineStoreUrl } } }
            }
          }`,
        variables: { handle: req.params.handle }
      }),
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// Generic GraphQL proxy: POST { query, variables }
app.post("/api/shopify", async (req, res) => {
  // Require authentication
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'auth required' });
  }
  // Reject GraphQL mutations — only read queries are allowed through this proxy
  const gqlQuery = (req.body && typeof req.body.query === 'string') ? req.body.query : '';
  if (/\bmutation\b/i.test(gqlQuery)) {
    return res.status(403).json({ error: 'GraphQL mutations are not allowed' });
  }
  try {
    const r = await fetch(`https://${process.env.SHOP_DOMAIN}/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
      },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Proxy error" });
  }
});

// Convenience endpoint: GET products by collection handle
app.get("/api/collection/:handle", async (req, res) => {
  const QUERY = `
    query ($handle:String!, $first:Int=24) {
      collection(handle:$handle){
        title
        products(first:$first, sortKey:TITLE){
          edges{
            node{
              id handle title
              featuredImage{ url altText }
              priceRangeV2{ minVariantPrice{ amount currencyCode } }
              variants(first:1){ edges{ node{ id title price{ amount currencyCode } } } }
              onlineStoreUrl
              # If you add a metafield for external links, uncomment:
              # metafield(namespace:"carro", key:"external_url"){ value }
            }
          }
        }
      }
    }`;
  try {
    const r = await fetch(`https://${process.env.SHOP_DOMAIN}/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { handle: req.params.handle } }),
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Collection error" });
  }
});

// GET /api/products?first=20  -> quick sanity check for any products at all
app.get("/api/products", async (req, res) => {
  const first = Math.min(parseInt(req.query.first || "20", 10), 100);
  const QUERY = `
    query ($first:Int!) {
      products(first:$first, sortKey:TITLE) {
        edges {
          node {
            id handle title onlineStoreUrl
            featuredImage { url altText }
            priceRangeV2 { minVariantPrice { amount currencyCode } }
            variants(first:1) { edges { node { id title price { amount currencyCode } } } }
          }
        }
      }
    }`;
  try {
    const r = await fetch(`https://${process.env.SHOP_DOMAIN}/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { first } }),
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Products error" });
  }
});


/* -------------------- Authentication Helper -------------------- */

// Helper function to get authentication token from session
function getAuthToken(req) {
  // Try session first
  if (req.session && req.session.authToken) {
    return req.session.authToken;
  }

  // Fallback to cookie if session doesn't have it
  if (req.cookies && req.cookies.authToken) {
    // Store in session for future use
    if (req.session) {
      req.session.authToken = req.cookies.authToken;
    }
    return req.cookies.authToken;
  }

  // Fallback to Authorization header (for client-side token from localStorage)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Store in session for future use
    if (req.session && token) {
      req.session.authToken = token;
    }
    return token;
  }

  return null;
}

// Helper function to validate authentication token exists
function requireAuthToken(req, res) {
  const token = getAuthToken(req);

  if (!token || typeof token !== 'string') {
    console.warn('⚠️  Authentication token missing');
    console.warn('  Session userId:', req.session?.userId);
    console.warn('  Session keys:', req.session ? Object.keys(req.session) : 'no session');
    res.status(401).json({
      error: "Authentication required. Please sign up or log in again.",
      detail: "Missing authentication token"
    });
    return null; // Return null after sending response
  }

  return token;
}

/* -------------------- API: Sign Up -------------------- */

app.post("/api/signup", authLimiter, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, terms_accepted } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" });
    }

    // Validate terms acceptance
    if (!terms_accepted) {
      return res.status(400).json({ error: "You must agree to the terms of use and privacy policy" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password complexity
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters with letters and numbers" });
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters with letters and numbers" });
    }
    // Reject the most common passwords (top-50 subset)
    const COMMON_PASSWORDS = new Set([
      'password', 'password1', 'password12', 'password123', 'password1234',
      '12345678', '123456789', '1234567890', '12345678910',
      'qwerty123', 'qwerty1234', 'qwertyui', 'qwerty12',
      'welcome1', 'welcome12', 'welcome123',
      'letmein1', 'letmein12',
      'monkey12', 'monkey123',
      'dragon12', 'dragon123',
      'master12', 'master123',
      'baseball1', 'baseball12',
      'football1', 'football12',
      'superman1', 'superman12',
      'batman12', 'batman123',
      'admin123', 'admin1234',
      'iloveyou1', 'iloveyou12',
      'sunshine1', 'sunshine12',
      'princess1', 'princess12',
      'shadow12', 'shadow123',
      'mustang1', 'mustang12',
      'access12', 'access123',
      'flower12', 'flower123',
      'passw0rd', 'p@ssword',
    ]);
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      return res.status(400).json({ error: "Password must be at least 8 characters with letters and numbers" });
    }

    // Forward request to backend server
    try {
      const backendResponse = await fetch(`${RENDER_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : null,
          password: password,
          terms_accepted: terms_accepted
        })
      });

      // Check for token in response headers first
      const headerToken = backendResponse.headers.get('authorization') ||
        backendResponse.headers.get('x-auth-token') ||
        backendResponse.headers.get('x-access-token');

      const backendData = await backendResponse.json();

      // Log full backend response for debugging (secrets redacted)
      console.log('🔍 Backend registration response:', JSON.stringify(redactSecrets(backendData), null, 2));
      console.log('🔍 Response headers:', {
        authorization: backendResponse.headers.get('authorization'),
        'x-auth-token': backendResponse.headers.get('x-auth-token'),
        'x-access-token': backendResponse.headers.get('x-access-token')
      });

      if (!backendResponse.ok) {
        // Forward backend error to frontend. The auth service returns its
        // message under FastAPI's `detail` key (e.g. "Phone already
        // registered"), which can be a string OR a list of validation
        // objects — handle both so the real reason reaches the browser.
        const detail = Array.isArray(backendData.detail)
          ? backendData.detail
              .map((d) => d?.msg || d?.message || (typeof d === "string" ? d : JSON.stringify(d)))
              .join("; ")
          : backendData.detail;
        return res.status(backendResponse.status).json({
          error:
            detail ||
            backendData.error ||
            backendData.message ||
            "Failed to create account"
        });
      }

      // Extract authentication token from response (check common field names)
      // Check headers first, then body fields, then nested data structure
      let authToken = headerToken;

      if (!authToken) {
        // Extract from response body
        authToken = backendData.token ||
          backendData.access_token ||
          backendData.auth_token ||
          backendData.accessToken ||
          (backendData.user && backendData.user.token) ||
          (backendData.user && backendData.user.access_token) ||
          (backendData.data && backendData.data.token) ||
          (backendData.data && backendData.data.access_token) ||
          (backendData.data && backendData.data.auth_token) ||
          (backendData.data && backendData.data.accessToken) ||
          (backendData.data && backendData.data.user && backendData.data.user.token) ||
          (backendData.data && backendData.data.user && backendData.data.user.access_token) ||
          null;
      }

      // Clean up header token if it has "Bearer " prefix
      if (authToken && typeof authToken === 'string' && authToken.startsWith('Bearer ')) {
        authToken = authToken.substring(7);
      }

      // Extract user info from backend response
      const userData = backendData.user || (backendData.data && backendData.data.user) || backendData.data || {};
      const userId = userData.id || backendData.id || backendData.user_id || (backendData.data && backendData.data.id);

      if (!userId) {
        // Backend returned no user id — refuse to create a phantom session
        console.error('❌ Registration: backend returned no user id, cannot create session');
        return res.status(500).json({ error: "Account creation failed: no user id returned from backend." });
      }

      if (!authToken) {
        console.warn('⚠️  No auth token found in registration response');
      }

      console.log('✅ User registered via backend:', email);

      // Session fixation protection: regenerate session before writing user data
      req.session.regenerate((regenErr) => {
        if (regenErr) {
          console.error('❌ Error regenerating session:', regenErr);
          return res.status(500).json({ error: "Failed to establish session.", detail: regenErr.message });
        }

        req.session.userId = userId;
        req.session.userEmail = userData.email || email;
        req.session.userName = `${first_name} ${last_name}`;

        if (authToken) {
          req.session.authToken = authToken;
          // Set HTTP-only cookie with token (for server-side access)
          res.cookie('authToken', authToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
        }

        req.session.save((err) => {
          if (err) {
            console.error('❌ Error saving session:', err);
            return res.status(500).json({
              error: "Failed to save session. Please try again.",
              detail: err.message
            });
          }

          console.log('✅ Session saved successfully');

          // Issue CSRF token immediately so the next fetch can include X-CSRF-Token.
          issueCsrfToken(req, res);

          // Return success response — token intentionally omitted (session cookie is the auth mechanism)
          return res.json({
            success: true,
            message: backendData.message || "Account created successfully",
            user: backendData.user || (backendData.data && backendData.data.user) || {
              email: email,
              name: `${first_name} ${last_name}`
            },
            // Post-signup: free tier is temporarily disabled — drop new users
            // straight into the paid assessment flow. Restore '?tier=free' here
            // when re-enabling the Free Mini / 30-question free assessment.
            redirect: '/assessment/?tier=paid'
          });
        });
      });
    } catch (fetchErr) {
      console.error('❌ Backend API unreachable during signup:', fetchErr.message);
      return res.status(503).json({
        success: false,
        error: 'Authentication service unavailable. Please try again later.'
      });
    }
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account", detail: err.message });
  }
});


/* -------------------- API: Login -------------------- */

app.post("/api/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format (mirrors /api/signup)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password length (basic gate — complexity enforced at signup only)
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const loginPayload = {
      email: email.toLowerCase().trim(),
      password
    };

    let backendResponse;
    try {
      backendResponse = await fetch(`${RENDER_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginPayload)
      });
    } catch (fetchErr) {
      console.error("❌ Backend login fetch error:", fetchErr.message);
      return res.status(503).json({
        error: "Unable to reach authentication service. Please try again later.",
        detail: fetchErr.message
      });
    }

    const responseText = await backendResponse.text();
    let backendData = {};
    if (responseText) {
      try {
        backendData = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("❌ Invalid JSON from login backend:", jsonErr.message);
        if (!backendResponse.ok) {
          return res.status(backendResponse.status).json({
            error: "Authentication server returned invalid response.",
            detail: responseText.substring(0, 200)
          });
        }
      }
    }

    if (!backendResponse.ok) {
      const errorMessage =
        backendData.error ||
        backendData.message ||
        backendData.detail ||
        `Login failed (${backendResponse.status})`;
      return res.status(backendResponse.status).json({
        error: errorMessage,
        detail: backendData.errors || backendData.detail || responseText
      });
    }

    // Log full backend response for debugging (mirrors /api/signup, secrets redacted)
    console.log('🔍 Backend login response:', JSON.stringify(redactSecrets(backendData), null, 2));
    console.log('🔍 Response headers:', {
      authorization: backendResponse.headers.get('authorization'),
      'x-auth-token': backendResponse.headers.get('x-auth-token'),
      'x-access-token': backendResponse.headers.get('x-access-token')
    });

    const headerToken =
      backendResponse.headers.get("authorization") ||
      backendResponse.headers.get("x-auth-token") ||
      backendResponse.headers.get("x-access-token");

    let authToken =
      backendData.access_token ||
      backendData.token ||
      backendData.auth_token ||
      (backendData.data && (backendData.data.access_token || backendData.data.token)) ||
      headerToken ||
      null;

    if (authToken && typeof authToken === "string" && authToken.startsWith("Bearer ")) {
      authToken = authToken.substring(7);
    }

    if (!authToken) {
      console.error("❌ Login succeeded but authentication token missing");
      return res.status(500).json({
        error: "Authentication token missing from login response."
      });
    }

    const tokenType =
      backendData.token_type ||
      backendData.type ||
      backendData.data?.token_type ||
      "bearer";

    const userData =
      backendData.user ||
      backendData.data?.user ||
      backendData.data ||
      {};

    // Check is_active in local DB (if available). Deactivated accounts are blocked
    // even when the upstream auth service accepts the credentials.
    const loginUserId = (userData && (userData.id || userData.user_id)) ||
      (backendData.data && (backendData.data.id || backendData.data.user_id)) ||
      backendData.id || backendData.user_id || null;

    if (pool && loginUserId) {
      try {
        const activeCheck = await pool.query(
          'SELECT is_active FROM users WHERE id = $1 LIMIT 1',
          [loginUserId]
        );
        if (activeCheck.rows.length > 0 && activeCheck.rows[0].is_active === false) {
          console.warn(`[login] Blocked deactivated user id=${loginUserId}`);
          return res.status(403).json({
            error: "This account has been deactivated. Please contact support."
          });
        }
      } catch (dbErr) {
        // Non-fatal: local DB unavailable — upstream auth is the authority.
        console.warn('[login] is_active DB check skipped (DB error):', dbErr.message);
      }
    } else if (!pool) {
      console.warn('[login] is_active check skipped — no DB configured (test/dev env)');
    }

    console.log('✅ User logged in via backend:', loginPayload.email);

    // Session fixation protection: regenerate session before writing user data
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("❌ Error regenerating session after login:", regenErr);
        return res.status(500).json({ error: "Failed to establish session.", detail: regenErr.message });
      }

      // #31 fix: if the backend response omits both id and user_id, refuse to
      // create a session — the user would appear unauthenticated downstream.
      const resolvedUserId = userData.id || userData.user_id || backendData.id || backendData.user_id || null;
      if (!resolvedUserId) {
        console.error('❌ Login: backend returned no user id, cannot create session');
        return res.status(500).json({ error: "Backend authentication response missing user id." });
      }
      req.session.userId = resolvedUserId;
      req.session.userEmail = userData.email || loginPayload.email;
      const derivedName = [userData.first_name, userData.last_name].filter(Boolean).join(" ").trim();
      req.session.userName = userData.name || derivedName || null;
      req.session.authToken = authToken;

      res.cookie("authToken", authToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      req.session.save((err) => {
        if (err) {
          console.error("❌ Error saving session after login:", err);
          return res.status(500).json({
            error: "Failed to save session after login. Please try again.",
            detail: err.message
          });
        }

        console.log('✅ Session saved successfully');

        // Issue CSRF token immediately so the next fetch can include X-CSRF-Token.
        issueCsrfToken(req, res);

        // token intentionally omitted from response — session cookie is the auth mechanism
        return res.json({
          success: true,
          message: backendData.message || "Login successful",
          token_type: tokenType,
          user: userData && Object.keys(userData).length > 0 ? userData : { email: loginPayload.email },
          // For now: route every successful login straight to the paid
          // assessment so users land on the full Health Intelligence flow.
          // Swap back to "/membershipsurvey" once the survey is reinstated.
          redirect: "/assessment/?tier=paid"
        });
      });
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      error: "Failed to log in",
      detail: err.message
    });
  }
});


/* -------------------- API: Membership Survey -------------------- */

// Support both POST and PUT methods for survey submission
const handleSurveySubmit = async (req, res) => {
  try {
    const {
      age,
      energy_rating,
      exercise_frequency,
      exercise_type,
      diet_rating,
      dietary_restrictions,
      sleep_quality,
      stress_levels,
      medical_conditions,
      medications,
      allergies,
      primary_health_goal,
      approaches_interest,
      affirmations_inspire,
      symptoms_experiencing
    } = req.body;

    // Validate required field (age) - now accepts age ranges like "18-24", "25-29", etc.
    if (!age || typeof age !== 'string' || age.trim() === '') {
      return res.status(400).json({ error: "Valid age range is required" });
    }

    console.log('Survey submitted');

    // Get user_id from session
    const user_id = req.session.userId || null;

    // Get IP address (trust proxy is set above so req.ip is already correct)
    const ip_address = req.ip || 'unknown';

    // Map frontend field names to backend API format
    // Helper function to convert string/array to array
    const toArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        // Handle comma-separated strings
        if (value.includes(',')) {
          return value.split(',').map(s => s.trim()).filter(s => s);
        }
        return [value];
      }
      return [String(value)];
    };

    const symptomsList = toArray(symptoms_experiencing);
    const energyList = toArray(energy_rating);
    const exerciseTypes = toArray(exercise_type);
    const restrictionList = toArray(dietary_restrictions);
    const conditionList = toArray(medical_conditions);
    const approachesList = toArray(approaches_interest);
    const goalList = toArray(primary_health_goal);
    const affirmationCategories = toArray(affirmations_inspire);

    // Prepare survey data for backend API (matching expected format)
    const surveyData = {
      age_range: age || "",
      menopause_stage: "", // Not collected in survey, set to null
      symptoms: symptomsList,
      overall_energy: energyList,
      exercise_frequency: exercise_frequency || "",
      exercise_types: exerciseTypes,
      diet: diet_rating || "",
      restrictions: restrictionList,
      sleep_quality: sleep_quality || "",
      stress_level: stress_levels || "",
      conditions: conditionList,
      medications: medications || "",
      allergies: allergies || "",
      health_goal: goalList,
      approaches: approachesList,
      affirmation_categories: affirmationCategories
    };

    const fastapiSnapshot = {
      user_id,
      mood: (stress_levels || "").trim(),
      goals: goalList[0] || "",
      symptoms: symptomsList.join(", "),
      preferences: approachesList.join(", "),
      category: affirmationCategories[0] || null
    };

    const hasFastapiInput = [fastapiSnapshot.mood, fastapiSnapshot.goals, fastapiSnapshot.symptoms, fastapiSnapshot.preferences]
      .some((value) => typeof value === "string" && value.trim().length > 0);

    if (!hasFastapiInput) {
      fastapiSnapshot.goals = "General wellness support";
    }

    // Cache survey data in session for downstream FastAPI requests
    req.session.latestSurvey = {
      ...surveyData,
      ...fastapiSnapshot
    };

    // Forward request to backend server
    try {
      // Get authentication token from session
      const authToken = requireAuthToken(req, res);
      if (!authToken || typeof authToken !== 'string') {
        return; // requireAuthToken already sent the error response
      }

      const hasToken = authToken.trim() !== "";

      console.log('🔍 Backend API Request Details:');
      console.log('  URL:', `${RENDER_BASE_URL}/api/v1/profile`);
      console.log('  Method: PUT (backend API)');
      console.log('  Frontend Method:', req.method);
      console.log('  Auth Token Present:', hasToken);
      console.log('  Auth Token Length:', authToken.length);
      console.log('  Auth Token Preview:', hasToken ? `${authToken.substring(0, 10)}...` : 'N/A');
      console.log('  Request Body:', JSON.stringify(surveyData, null, 2));

      const backendResponse = await fetch(`${RENDER_BASE_URL}/api/v1/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(surveyData)
      });

      console.log('🔍 Backend API Response Details:');
      console.log('  Status:', backendResponse.status);
      console.log('  Status Text:', backendResponse.statusText);
      console.log('  OK:', backendResponse.ok);
      console.log('  Headers:', Object.fromEntries(backendResponse.headers.entries()));

      // Check content type before parsing
      const contentType = backendResponse.headers.get('content-type');
      let backendData;
      const responseText = await backendResponse.text();

      console.log('  Response Text Length:', responseText.length);
      console.log('  Response Text:', responseText);

      // Handle 405 Method Not Allowed specifically
      if (backendResponse.status === 405) {
        console.error('❌ 405 Method Not Allowed Error:');
        console.error('  The backend endpoint may not accept POST requests.');
        console.error('  Possible solutions:');
        console.error('    1. Check if endpoint requires PUT or PATCH instead of POST');
        console.error('    2. Verify the endpoint path is correct');
        console.error('    3. Check if authentication token is valid');
        console.error('    4. Verify CORS settings allow POST method');

        return res.status(405).json({
          error: "Backend endpoint does not accept POST method. Please contact support.",
          detail: "The API endpoint may require a different HTTP method (PUT/PATCH) or the endpoint path may be incorrect.",
          status: 405,
          responseText: responseText
        });
      }

      if (contentType && contentType.includes('application/json')) {
        try {
          if (!responseText || responseText.trim() === '') {
            // Empty response - treat as success if status is ok
            if (backendResponse.ok) {
              console.log('✅ Survey submitted via backend (empty response):', user_id || 'anonymous');
              return res.json({
                success: true,
                id: 'submitted',
                message: "Survey submitted successfully"
              });
            } else {
              throw new Error('Backend returned empty response');
            }
          }
          backendData = JSON.parse(responseText);
        } catch (jsonErr) {
          console.error('❌ JSON parsing error from backend:', jsonErr.message);
          return res.status(500).json({
            error: "Invalid response from backend server. Please try again later.",
            detail: jsonErr.message
          });
        }
      } else {
        // Non-JSON response
        console.error('❌ Non-JSON response from backend:', responseText.substring(0, 200));

        if (backendResponse.ok) {
          // If status is ok but not JSON, treat as success
          console.log('✅ Survey submitted via backend (non-JSON response):', user_id || 'anonymous');
          return res.json({
            success: true,
            id: 'submitted',
            message: "Survey submitted successfully"
          });
        } else {
          return res.status(backendResponse.status).json({
            error: "Backend server error. Please try again later.",
            detail: responseText.substring(0, 200)
          });
        }
      }

      if (!backendResponse.ok) {
        // Forward backend error to frontend
        const errorMessage = backendData.error || backendData.message || `Backend error (${backendResponse.status})`;
        console.error('❌ Backend API error:', errorMessage);
        console.error('  Status:', backendResponse.status);
        console.error('  Response Data:', backendData);

        // Provide more specific error messages based on status code
        let userFriendlyMessage = errorMessage;
        if (backendResponse.status === 401) {
          userFriendlyMessage = "Authentication failed. Please check your credentials.";
        } else if (backendResponse.status === 403) {
          userFriendlyMessage = "Access forbidden. You may not have permission to perform this action.";
        } else if (backendResponse.status === 404) {
          userFriendlyMessage = "Endpoint not found. The API endpoint may have changed.";
        } else if (backendResponse.status === 405) {
          userFriendlyMessage = "Method not allowed. The endpoint may require a different HTTP method.";
        } else if (backendResponse.status === 500) {
          userFriendlyMessage = "Server error. Please try again later.";
        } else if (backendResponse.status >= 500) {
          userFriendlyMessage = "Backend server error. Please try again later.";
        }

        return res.status(backendResponse.status).json({
          error: userFriendlyMessage,
          detail: errorMessage,
          status: backendResponse.status
        });
      }

      console.log('✅ Survey submitted via backend:', user_id || 'anonymous');

      // Return success response
      return res.json({
        success: true,
        id: backendData.id || backendData.profile_id || 'submitted',
        message: backendData.message || "Survey submitted successfully"
      });
    } catch (fetchErr) {
      console.error('❌ Backend API fetch error:', fetchErr.message);
      console.error('  Error Type:', fetchErr.name);
      console.error('  Error Code:', fetchErr.code);
      console.error('  Stack:', fetchErr.stack);

      // Handle network errors specifically
      if (fetchErr.code === 'ECONNREFUSED' || fetchErr.code === 'ENOTFOUND' || fetchErr.message.includes('fetch failed')) {
        console.error('  Network Error: Unable to connect to backend server');
        return res.status(503).json({
          error: "Unable to connect to backend server. Please try again later.",
          detail: "Service temporarily unavailable",
          code: fetchErr.code
        });
      }

      return res.status(500).json({
        error: "Failed to connect to backend server. Please try again later.",
        detail: fetchErr.message,
        code: fetchErr.code || 'UNKNOWN'
      });
    }
  } catch (err) {
    console.error("Survey submission error:", err);
    res.status(500).json({ error: "Failed to submit survey", detail: err.message });
  }
};

// Register route for both POST and PUT methods
app.post("/api/survey/submit", handleSurveySubmit);
app.put("/api/survey/submit", handleSurveySubmit);


/* -------------------- API: Authentication -------------------- */

// Check authentication status
app.get("/api/auth/status", (req, res) => {
  try {
    // Set explicit Content-Type header to ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    // Log request for debugging
    console.log('🔍 GET /api/auth/status - Request received');
    console.log('  Session ID:', req.sessionID);
    console.log('  Session exists:', !!req.session);
    console.log('  Session userId:', req.session?.userId);
    console.log('  Session keys:', req.session ? Object.keys(req.session) : 'no session');

    const isAuthenticated = !!(req.session && req.session.userId);

    if (isAuthenticated) {
      console.log('✅ User authenticated');
      return res.json({
        authenticated: true,
        userId: req.session.userId,
        userEmail: req.session.userEmail || null,
        userName: req.session.userName || null
      });
    } else {
      console.log('❌ User not authenticated');
      return res.json({
        authenticated: false
      });
    }
  } catch (err) {
    console.error('❌ Error in /api/auth/status:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      authenticated: false,
      error: 'Internal server error',
      detail: err.message
    });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  try {
    // Clear auth token cookie — attributes must match exactly how it was set
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    });

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Error destroying session:', err);
        return res.status(500).json({
          error: "Failed to logout",
          detail: err.message
        });
      }

      console.log('✅ User logged out successfully');
      return res.json({
        success: true,
        message: "Logged out successfully"
      });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Failed to logout", detail: err.message });
  }
});

/* -------------------- API: Contact Form Proxy -------------------- */

/**
 * POST /api/contact
 * Proxies the public contact form to the Zapier webhook stored in
 * ZAPIER_CONTACT_WEBHOOK_URL.  Validating + rate-limiting here prevents
 * direct spam to the hard-coded webhook URL that was previously exposed
 * in contact.html (P2 bug fix).
 */
app.post("/api/contact", contactLimiter, async (req, res) => {
  if (!ZAPIER_CONTACT_WEBHOOK_URL) {
    return res.status(503).json({ error: "Contact form is currently unavailable. Please try again later." });
  }

  let { name, email, phone, message } = req.body;

  // Coerce to strings and length-cap each field.
  name    = String(name    ?? '').slice(0, 100).trim();
  email   = String(email   ?? '').slice(0, 200).trim();
  phone   = String(phone   ?? '').slice(0, 30).trim();
  message = String(message ?? '').slice(0, 5000).trim();

  // Basic email format check.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email address is required." });
  }
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const zapiResp = await fetch(ZAPIER_CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, phone, message,
        timestamp: new Date().toISOString(),
        source: 'Empress Health Contact Form'
      }),
      signal: AbortSignal.timeout(10_000)
    });

    if (!zapiResp.ok) {
      console.error('[contact] Zapier webhook returned', zapiResp.status);
      return res.status(502).json({ error: "Failed to deliver message. Please try again." });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[contact] Webhook error:', err.message);
    return res.status(502).json({ error: "Failed to deliver message. Please try again." });
  }
});

/* -------------------- API: Feedback Submission -------------------- */

app.post("/api/feedback/submit", async (req, res) => {
  try {
    const {
      interest_level,
      valuable_features,
      likelihood_to_register,
      would_recommend,
      willingness_to_pay,
      lang
    } = req.body;

    // Validate required fields
    if (!interest_level) {
      return res.status(400).json({ error: "Interest level is required" });
    }

    // Ensure valuable_features is an array of strings
    let valuableFeaturesArray = [];
    if (Array.isArray(valuable_features)) {
      valuableFeaturesArray = valuable_features.map(feature => String(feature).trim()).filter(feature => feature.length > 0);
    } else if (valuable_features) {
      // Handle case where it might be a single value
      valuableFeaturesArray = [String(valuable_features).trim()];
    }

    if (valuableFeaturesArray.length === 0) {
      return res.status(400).json({ error: "At least one valuable feature must be selected" });
    }

    // Convert likelihood_to_register to integer
    const likelihoodInt = parseInt(likelihood_to_register, 10);
    if (!likelihood_to_register || isNaN(likelihoodInt) || likelihoodInt < 1 || likelihoodInt > 5) {
      return res.status(400).json({ error: "Likelihood to register must be a number between 1 and 5" });
    }

    if (!would_recommend) {
      return res.status(400).json({ error: "Recommendation selection is required" });
    }

    if (!willingness_to_pay) {
      return res.status(400).json({ error: "Subscription tier selection is required" });
    }

    // Map frontend willingness_to_pay values to backend expected values
    const willingnessToPayMap = {
      "VIP — $49/month": "$49 per month",
      "Premium — $39/month": "$39 per month",
      "Plus — $25/month": "$25 per month",
      "$9/month – Essential": "$9 per month",
      "I would not pay": "I would not pay for a subscription"
    };

    const mappedWillingnessToPay = willingnessToPayMap[willingness_to_pay] || willingness_to_pay;

    // Prepare feedback data for backend
    const feedbackData = {
      interest_level: interest_level,
      valuable_features: valuableFeaturesArray, // Array of strings
      likelihood_to_register: likelihoodInt, // Use the converted integer
      would_recommend: would_recommend,
      willingness_to_pay: mappedWillingnessToPay, // Use mapped value
      lang: lang || 'en'
    };

    console.log('Feedback form submitted');
    console.log('📤 Feedback data being sent:', JSON.stringify(feedbackData, null, 2));

    // Forward request to backend server
    try {
      // Get authentication token from session
      const authToken = requireAuthToken(req, res);
      if (!authToken || typeof authToken !== 'string') {
        return; // requireAuthToken already sent the error response
      }

      const backendResponse = await fetch(`${RENDER_BASE_URL}/api/v1/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(feedbackData)
      });

      // Check content type before parsing
      const contentType = backendResponse.headers.get('content-type');
      let backendData;
      const responseText = await backendResponse.text();

      if (contentType && contentType.includes('application/json')) {
        try {
          if (!responseText || responseText.trim() === '') {
            // Empty response - treat as success if status is ok
            if (backendResponse.ok) {
              console.log('✅ Feedback submitted via backend');
              return res.json({
                success: true,
                message: "Feedback submitted successfully"
              });
            } else {
              throw new Error('Backend returned empty response');
            }
          }
          backendData = JSON.parse(responseText);
        } catch (jsonErr) {
          console.error('❌ JSON parsing error from backend:', jsonErr.message);
          return res.status(500).json({
            error: "Invalid response from backend server. Please try again later.",
            detail: jsonErr.message
          });
        }
      } else {
        // Non-JSON response
        console.error('❌ Non-JSON response from backend:', responseText.substring(0, 200));

        if (backendResponse.ok) {
          // If status is ok but not JSON, treat as success
          console.log('✅ Feedback submitted via backend (non-JSON response)');
          return res.json({
            success: true,
            message: "Feedback submitted successfully"
          });
        } else {
          return res.status(backendResponse.status).json({
            error: "Backend server error. Please try again later.",
            detail: responseText.substring(0, 200)
          });
        }
      }

      if (!backendResponse.ok) {
        // Forward backend error to frontend
        console.error('❌ Backend API error response:');
        console.error('  Status:', backendResponse.status);
        console.error('  Status Text:', backendResponse.statusText);
        console.error('  Full error response:', JSON.stringify(backendData, null, 2));
        console.error('  Raw response text:', responseText);

        const errorMessage = backendData.error || backendData.message || backendData.detail || `Backend error (${backendResponse.status})`;
        const errorDetail = backendData.errors || backendData.detail || backendData;

        return res.status(backendResponse.status).json({
          error: errorMessage,
          detail: errorDetail
        });
      }

      console.log('✅ Feedback submitted via backend');

      // Return success response
      return res.json({
        success: true,
        message: backendData.message || "Feedback submitted successfully"
      });
    } catch (fetchErr) {
      console.error('❌ Backend API error:', fetchErr.message);

      // Handle network errors specifically
      if (fetchErr.code === 'ECONNREFUSED' || fetchErr.code === 'ENOTFOUND' || fetchErr.message.includes('fetch failed')) {
        return res.status(503).json({
          error: "Unable to connect to backend server. Please try again later.",
          detail: "Service temporarily unavailable"
        });
      }

      return res.status(500).json({
        error: "Failed to connect to backend server. Please try again later.",
        detail: fetchErr.message
      });
    }
  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ error: "Failed to submit feedback", detail: err.message });
  }
});

// Helper function to map user profile to FastAPI request format
function mapProfileToFastAPIRequest(userProfile, userId) {
  return {
    user_id: userId || userProfile?.user_id || null,
    category: userProfile?.health_goal?.[0] || userProfile?.affirmation_categories?.[0] || null,
    mood: userProfile?.stress_level || "",
    goals: userProfile?.health_goal?.[0] || "",
    symptoms: Array.isArray(userProfile?.symptoms) ? userProfile.symptoms.join(", ") : (userProfile?.symptoms || ""),
    preferences: Array.isArray(userProfile?.approaches) ? userProfile.approaches.join(", ") : (userProfile?.approaches || "")
  };
}

async function getUserProfileForRecommendations(req) {
  // 1. Check body
  if (req.body && req.body.profile) {
    return req.body.profile;
  }
  // 2. Check session survey
  if (req.session && req.session.latestSurvey) {
    return req.session.latestSurvey;
  }
  // 3. Check session user (minimal profile from session)
  if (req.session && req.session.userId) {
    return {
      user_id: req.session.userId,
      email: req.session.userEmail,
      name: req.session.userName
    };
  }
  // 4. Session empty: recover profile using auth token from cookie/header
  const token = getAuthToken(req);
  if (token) {
    console.log('Session lost, attempting to recover profile using auth token...');
    const profile = await fetchProfileFromBackend(null, token);
    if (profile) {
      if (req.session) {
        req.session.userId = profile.id || profile.user_id;
        req.session.userEmail = profile.email;
        req.session.userName = profile.first_name ? `${profile.first_name} ${profile.last_name}`.trim() : (profile.name || '');
        req.session.authToken = token;
        req.session.latestSurvey = profile;
      }
      return profile;
    }
  }
  return null;
}

async function fetchProfileFromBackend(userId, token) {
  if (!token) return null;

  try {
    const response = await fetch(`${RENDER_BASE_URL}${RENDER_PROFILE_ME_PATH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.user || data.data || data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile from backend:', error);
    return null;
  }
}

function buildFastAPIPayload(userProfile, userId) {
  if (!userProfile) return null;
  const directFields = ["mood", "goals", "symptoms", "preferences", "category", "user_id"];
  const hasDirectFields = directFields.some((field) => {
    const value = userProfile[field];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  });

  if (hasDirectFields) {
    return {
      user_id: userProfile.user_id || userId || null,
      category: userProfile.category || null,
      mood: userProfile.mood || "",
      goals: userProfile.goals || "",
      symptoms: userProfile.symptoms || "",
      preferences: userProfile.preferences || ""
    };
  }

  return mapProfileToFastAPIRequest(userProfile, userId);
}

function hasFastapiInput(payload) {
  if (!payload) return false;
  return Object.values(payload).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    return value !== null && value !== undefined;
  });
}

async function callFastAPIRecommendations(payload, requestId = "") {
  const url = `${FASTAPI_URL}/api/recommendations/generate`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FASTAPI_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`FastAPI returned invalid JSON: ${err.message}`);
    }

    if (!response.ok) {
      const detail = data?.detail || text || `status ${response.status}`;
      throw new Error(`FastAPI error: ${detail}`);
    }

    console.log(`[${requestId}] ✅ FastAPI response received`);

    // STRICT grounding policy: reject upstream payloads whose recommendations
    // lack evidence_refs. Falling through to the catalog-based generator is
    // safer than emitting ungrounded clinical content to a user. Set
    // ALLOW_UNGROUNDED_FASTAPI=1 to revert to warn-only (NOT recommended).
    const recs = data?.recommendations || data?.data?.recommendations;
    if (Array.isArray(recs) && recs.length > 0) {
      const missingRefs = recs.filter(
        (r) => !Array.isArray(r.evidence_refs) || r.evidence_refs.length === 0
      ).length;
      if (missingRefs > 0) {
        const msg = `FastAPI returned ${missingRefs}/${recs.length} recommendations without evidence_refs`;
        if (process.env.ALLOW_UNGROUNDED_FASTAPI === '1') {
          console.warn(`[${requestId}] ${msg} — unverified content allowed by ALLOW_UNGROUNDED_FASTAPI=1`);
        } else {
          console.error(`[${requestId}] ${msg} — REJECTING upstream payload, will fall through to grounded catalog`);
          throw new Error('upstream recommendations lack evidence_refs (strict grounding policy)');
        }
      }
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateGroqFallback(userProfile, requestId) {
  const [affirmationsResult, recsResult] = await Promise.all([
    generateAffirmations(userProfile, requestId),
    generateRecommendations(userProfile, requestId)
  ]);
  // generateRecommendations now returns { recommendations, clinician }
  const { recommendations, clinician } = recsResult || {};
  return {
    affirmations:    affirmationsResult,
    recommendations: recommendations || [],
    clinician:       clinician || null,
  };
}

function normalizeRecommendationPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }
  return payload;
}

function hasRecommendationContent(payload) {
  const normalized = normalizeRecommendationPayload(payload);
  if (!normalized || typeof normalized !== "object") {
    return false;
  }
  if (Array.isArray(normalized.products) && normalized.products.length > 0) {
    return true;
  }
  if (Array.isArray(normalized.recommendations) && normalized.recommendations.length > 0) {
    return true;
  }
  if (Array.isArray(normalized.items) && normalized.items.length > 0) {
    return true;
  }
  return false;
}

async function fetchRenderRecommendationEndpoint({ req, token, path, label }) {
  const requestId = label || `render-${Date.now().toString(36)}`;
  const backendUrl = `${RENDER_BASE_URL}${path}`;
  const method = (req.method || "GET").toUpperCase();
  const authHeader = req.headers.authorization || `Bearer ${token}`;

  console.log(`[${requestId}] ➡️ [render] Forwarding ${method} to backend:`, backendUrl);
  console.log(`[${requestId}]   ↳ Original URL:`, req.originalUrl);
  console.log(`[${requestId}]   ↳ Auth header provided:`, !!req.headers.authorization);

  const headers = {
    "Content-Type": "application/json",
    "Authorization": authHeader
  };

  const fetchOptions = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    const body = req.body && Object.keys(req.body).length > 0 ? req.body : null;
    if (body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
    }
  }

  const renderCtrl = new AbortController();
  const renderTimeout = setTimeout(() => renderCtrl.abort(), FASTAPI_TIMEOUT_MS);
  fetchOptions.signal = renderCtrl.signal;
  let backendResponse;
  try {
    backendResponse = await fetch(backendUrl, fetchOptions);
  } finally {
    clearTimeout(renderTimeout);
  }
  console.log(`[${requestId}] ⬅️ [render] Backend status:`, backendResponse.status, backendResponse.statusText);

  const contentType = backendResponse.headers.get("content-type") || "";
  const text = await backendResponse.text();
  console.log(`[${requestId}]   ↳ Response body length:`, text.length);
  console.log(`[${requestId}]   ↳ Response preview:`, text.slice(0, 800));

  let parsed = null;
  let isJson = false;
  if (contentType.includes("application/json")) {
    try {
      parsed = text ? JSON.parse(text) : {};
      isJson = true;
    } catch (err) {
      console.error(`[${requestId}] Failed to parse JSON response:`, err.message);
    }
  }

  return {
    requestId,
    backendUrl,
    ok: backendResponse.ok,
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: Object.fromEntries(backendResponse.headers.entries()),
    contentType,
    rawText: text,
    parsed,
    isJson
  };
}

function respondWithRenderResult(res, result) {
  if (result.isJson && result.parsed !== null && result.parsed !== undefined) {
    return res.status(result.status).json(result.parsed);
  }
  return res.status(result.status).send(result.rawText);
}

async function tryRenderAffirmations(req, res, token, requestId) {
  try {
    const result = await fetchRenderRecommendationEndpoint({
      req,
      token,
      path: "/api/v1/recommendations/affirmations/generate",
      label: `affirmations-${requestId}`
    });

    if (result.ok) {
      respondWithRenderResult(res, result);
      return true;
    }

    console.warn(`[${requestId}] Render affirmations request failed with status ${result.status}`);
    return false;
  } catch (err) {
    console.error(`[${requestId}] Render affirmations error:`, err.message);
    return false;
  }
}

async function tryRenderAffirmationsFromDb(req, res, token, requestId) {
  try {
    const result = await fetchRenderRecommendationEndpoint({
      req,
      token,
      path: "/api/v1/recommendations/affirmations/from-db",
      label: `affirmations-from-db-${requestId}`
    });

    if (result.ok) {
      respondWithRenderResult(res, result);
      return true;
    }

    console.warn(`[${requestId}] Render affirmations/from-db failed with status ${result.status}`);
    return false;
  } catch (err) {
    console.error(`[${requestId}] Render affirmations/from-db error:`, err.message);
    return false;
  }
}

async function tryRenderCombined(req, res, token, requestId) {
  try {
    const primary = await fetchRenderRecommendationEndpoint({
      req,
      token,
      path: "/api/v1/recommendations/combined",
      label: `combined-${requestId}`
    });

    if (primary.ok && primary.isJson && hasRecommendationContent(primary.parsed)) {
      respondWithRenderResult(res, primary);
      return true;
    }

    if (primary.ok) {
      console.warn(`[${requestId}] Render combined returned empty payload, attempting products-doctors fallback`);
    } else {
      console.warn(`[${requestId}] Render combined failed with status ${primary.status}`);
    }
  } catch (err) {
    console.error(`[${requestId}] Render combined request error:`, err.message);
  }

  try {
    const fallback = await fetchRenderRecommendationEndpoint({
      req,
      token,
      path: "/api/v1/recommendations/products-doctors",
      label: `combined-products-${requestId}`
    });

    if (fallback.ok) {
      respondWithRenderResult(res, fallback);
      return true;
    }

    console.warn(`[${requestId}] Products-doctors fallback failed with status ${fallback.status}`);
    return false;
  } catch (err) {
    console.error(`[${requestId}] Products-doctors fallback error:`, err.message);
    return false;
  }
}

// Affirmations from DB only - for frontend fallback when generate returns 503/500
app.get("/api/recommendations/affirmations/from-db", async (req, res) => {
  const requestId = `aff-db-${Date.now().toString(36)}`;

  try {
    const authToken = requireAuthToken(req, res);
    if (!authToken || typeof authToken !== "string") {
      return;
    }

    const handled = await tryRenderAffirmationsFromDb(req, res, authToken, requestId);
    if (handled) {
      return;
    }

    return res.status(503).json({
      error: "Unable to load affirmations from database."
    });
  } catch (err) {
    console.error(`[${requestId}] Affirmations from-db error:`, err);
    return res.status(500).json({
      error: "Failed to load affirmations from database",
      detail: err.message
    });
  }
});

// Get affirmations endpoint - prefer FastAPI, fall back to Groq, then legacy backend
app.get("/api/recommendations/affirmations/generate", async (req, res) => {
  const requestId = `aff-${Date.now().toString(36)}`;

  try {
    const authToken = requireAuthToken(req, res);
    if (!authToken || typeof authToken !== "string") {
      return; // requireAuthToken already handled the response
    }

    const handledByRender = await tryRenderAffirmations(req, res, authToken, requestId);
    if (handledByRender) {
      return;
    }

    let userProfile = await getUserProfileForRecommendations(req);

    // If profile is minimal (just ID) or missing critical fields, try to fetch full profile
    if (userProfile && (!userProfile.symptoms || !userProfile.goals)) {
      try {
        const uid = userProfile.user_id || userProfile.id;
        console.log(`[${requestId}] Fetching full profile from backend for user ${uid}`);
        const fullProfile = await fetchProfileFromBackend(uid, authToken);
        if (fullProfile) {
          // Map backend profile format to what we expect
          userProfile = {
            ...userProfile,
            ...fullProfile,
            symptoms: fullProfile.symptoms || userProfile.symptoms,
            goals: fullProfile.health_goal || fullProfile.goals || userProfile.goals,
            mood: fullProfile.stress_level || fullProfile.mood || userProfile.mood,
            preferences: fullProfile.approaches || fullProfile.preferences || userProfile.preferences
          };
          // Cache it back to session
          if (req.session) {
            req.session.latestSurvey = userProfile;
          }
        }
      } catch (err) {
        console.warn(`[${requestId}] Failed to fetch full profile:`, err.message);
      }
    }

    const fastapiPayload = buildFastAPIPayload(userProfile, req.session?.userId);

    if (hasFastapiInput(fastapiPayload)) {
      try {
        const fastapiData = await callFastAPIRecommendations(fastapiPayload, requestId);
        return res.json({
          success: true,
          source: "fastapi",
          message: "Affirmations generated via FastAPI",
          data: {
            affirmations: fastapiData.affirmations || [],
            recommendations: fastapiData.recommendations || []
          }
        });
      } catch (fastapiErr) {
        console.error(`[${requestId}] FastAPI affirmations failed:`, fastapiErr.message);
      }
    } else {
      console.warn(`[${requestId}] Insufficient profile data to call FastAPI for affirmations.`);
    }

    if (userProfile) {
      try {
        const result = await generateAffirmations(userProfile, requestId);
        // result.legacyStrings is DEPRECATED — present for backward compat; remove once frontend updated
        return res.json({
          success: true,
          source: "groq",
          message: "Affirmations generated via Groq fallback",
          data: {
            // Structured shape (new)
            affirmations: result.affirmations,
            citations: result.citations,
            // DEPRECATED: flat string array for legacy frontend consumers
            affirmations_legacy: result.legacyStrings
          }
        });
      } catch (groqErr) {
        console.error(`[${requestId}] Groq affirmations fallback failed:`, groqErr.message);
      }
    } else {
      console.warn(`[${requestId}] No user profile available for Groq affirmations fallback.`);
    }

    console.warn(`[${requestId}] All affirmation fallbacks failed.`);
    return res.status(503).json({
      error: "Unable to generate affirmations at this time."
    });
  } catch (err) {
    console.error("Affirmations proxy error:", err);
    return res.status(500).json({
      error: "Failed to generate affirmations",
      detail: err.message
    });
  }
});

// ─── Completion gate: require at least 60% of expected questions answered ───
// TOTAL_EXPECTED_QUESTIONS mirrors the 120-question assessment framework.
const TOTAL_EXPECTED_QUESTIONS = 120;

function computeCompletionPercent(responses) {
  if (!responses || typeof responses !== "object") return 0;
  const answered = Object.values(responses).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;
  return answered / TOTAL_EXPECTED_QUESTIONS;
}

async function handleCombinedRecommendations(req, res) {
  const requestId = `req-${Date.now().toString(36)}`;

  try {
    // ── Completion gate (runs before auth — validates payload shape only) ───
    const bodyResponses = req.body?.responses || req.body?.answers || null;
    if (bodyResponses) {
      const completionPercent = computeCompletionPercent(bodyResponses);
      if (completionPercent < 0.6) {
        return res.status(422).json({
          error:             "Assessment incomplete",
          completionPercent: Math.round(completionPercent * 100) / 100,
          message:           "Please answer at least 60% of questions before generating recommendations.",
        });
      }
    }

    const authToken = requireAuthToken(req, res);
    if (!authToken || typeof authToken !== "string") {
      return; // requireAuthToken already sent the response
    }

    const handledByRender = await tryRenderCombined(req, res, authToken, requestId);
    if (handledByRender) {
      return;
    }

    let userProfile = await getUserProfileForRecommendations(req);

    // If profile is minimal (just ID) or missing critical fields, try to fetch full profile
    if (userProfile && (!userProfile.symptoms || !userProfile.goals)) {
      try {
        const uid = userProfile.user_id || userProfile.id;
        console.log(`[${requestId}] Fetching full profile from backend for user ${uid}`);
        const fullProfile = await fetchProfileFromBackend(uid, authToken);
        if (fullProfile) {
          userProfile = {
            ...userProfile,
            ...fullProfile,
            symptoms: fullProfile.symptoms || userProfile.symptoms,
            goals: fullProfile.health_goal || fullProfile.goals || userProfile.goals,
            mood: fullProfile.stress_level || fullProfile.mood || userProfile.mood,
            preferences: fullProfile.approaches || fullProfile.preferences || userProfile.preferences
          };
          if (req.session) {
            req.session.latestSurvey = userProfile;
          }
        }
      } catch (err) {
        console.warn(`[${requestId}] Failed to fetch full profile:`, err.message);
      }
    }

    // ── POI edge case ────────────────────────────────────────────────────────
    const poiFlag = (
      Number(userProfile?.age) < 45 &&
      userProfile?.stage === "perimenopause" &&
      (
        (userProfile?.domainScores && userProfile.domainScores[1] <= 34) ||
        (Array.isArray(userProfile?.urgentItemFlags) &&
          userProfile.urgentItemFlags.some((f) =>
            (typeof f === "object" ? f?.question : f) === 2
          ))
      )
    );

    const fastapiPayload = buildFastAPIPayload(userProfile, req.session?.userId);

    if (hasFastapiInput(fastapiPayload)) {
      try {
        const fastapiData = await callFastAPIRecommendations(fastapiPayload, requestId);
        return res.json({
          success:         true,
          source:          "fastapi",
          affirmations:    fastapiData.affirmations || [],
          recommendations: fastapiData.recommendations || [],
          clinician:       fastapiData.clinician || null,
          poi_flag:        poiFlag,
          data:            fastapiData,
          message:         "Recommendations generated via FastAPI",
        });
      } catch (fastapiErr) {
        console.error(`[${requestId}] FastAPI integration failed:`, fastapiErr.message);
      }
    } else {
      console.warn(`[${requestId}] Insufficient profile data to call FastAPI.`);
    }

    // Catalog fallback: prefer the DB-backed userProfile, but fall through
    // to the request body so the curated catalog still works for users whose
    // profile isn't yet populated (e.g. fresh signup, paid-tier API direct caller).
    const catalogProfile = userProfile || {
      stage:                 req.body?.stage,
      age:                   req.body?.age,
      mhtActive:             req.body?.mhtActive,
      priorityCategorySlugs: req.body?.priorityCategorySlugs || req.body?.priority_category_slugs,
      topConcernDomainIds:   req.body?.topConcernDomainIds   || req.body?.top_concern_domain_ids,
      urgentItemFlags:       req.body?.urgent_flags          || req.body?.urgentItemFlags,
      symptoms:              req.body?.symptoms,
      goals:                 req.body?.health_goal || req.body?.goals,
      domainScores:          req.body?.domainScores,
    };

    if (catalogProfile && (catalogProfile.priorityCategorySlugs?.length || catalogProfile.symptoms || catalogProfile.goals)) {
      try {
        const groqData = await generateGroqFallback(catalogProfile, requestId);
        // Recompute POI now that we have a profile (whether from DB or request body)
        const finalPoiFlag = (
          Number(catalogProfile.age) < 45 &&
          catalogProfile.stage === "perimenopause" &&
          (
            (catalogProfile.domainScores && catalogProfile.domainScores[1] <= 34) ||
            (Array.isArray(catalogProfile.urgentItemFlags) &&
              catalogProfile.urgentItemFlags.some((f) =>
                (typeof f === "object" ? f?.question : f) === 2 ||
                (typeof f === "object" ? f?.question : f) === 1
              ))
          )
        ) || poiFlag;
        return res.json({
          success:         true,
          source:          "catalog",
          affirmations:    groqData.affirmations,
          recommendations: groqData.recommendations,
          clinician:       groqData.clinician,
          poi_flag:        finalPoiFlag,
          message:         "Recommendations generated via curated catalog",
        });
      } catch (groqErr) {
        console.error(`[${requestId}] Catalog fallback failed:`, groqErr.message);
      }
    } else {
      console.warn(`[${requestId}] No usable profile (DB or request body) for catalog fallback.`);
    }

    console.warn(`[${requestId}] All recommendation fallbacks failed.`);
    return res.status(503).json({
      error: "Unable to generate recommendations at this time."
    });
  } catch (err) {
    console.error("Combined recommendations error:", err);
    return res.status(500).json({
      error: "Failed to generate recommendations",
      detail: err.message
    });
  }
}

app.get("/api/recommendations/combined", handleCombinedRecommendations);
app.post("/api/recommendations/combined", handleCombinedRecommendations);

/* -------------------- Free assessment .docx report --------------------
 *
 * F6: Generates a 5-page personable .docx for free-tier users from the
 * payload assembled by AssessmentReportScreen (user, scores, priorities,
 * strengths, affirmations, recommendations). Returns the binary as a
 * downloadable attachment. Generator lives in lib/freeReportGenerator.js
 * so server.js stays focused on routing.
 */
/* -------------------- Assessment per-section feedback (F7) --------------------
 *
 * Personable comment box at the foot of every report section. Persists the
 * user's reflection as a JSONL line under uploads/assessment-feedback.jsonl
 * via lib/notify.js, and (in future) emails the Empress team when SMTP is
 * configured.
 */
app.post("/api/assessment/feedback", async (req, res) => {
  try {
    const { notify } = require("./lib/notify");
    const {
      sectionId,
      sectionTitle,
      comment,
      tier,
      firstName,
      completedAt,
    } = req.body || {};

    if (!sectionId || typeof sectionId !== "string") {
      return res.status(400).json({ error: "sectionId is required" });
    }
    const trimmed = typeof comment === "string" ? comment.trim() : "";
    if (!trimmed) {
      return res.status(400).json({ error: "comment is required" });
    }
    if (trimmed.length > 4000) {
      return res.status(400).json({ error: "comment is too long (max 4000 chars)" });
    }

    await notify("feedback", {
      sectionId: String(sectionId).slice(0, 80),
      sectionTitle: typeof sectionTitle === "string" ? sectionTitle.slice(0, 120) : null,
      comment: trimmed,
      tier: tier === "free" || tier === "paid" ? tier : null,
      firstName: typeof firstName === "string" ? firstName.slice(0, 80) : null,
      completedAt: typeof completedAt === "string" ? completedAt.slice(0, 60) : null,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[feedback] persist failed:", err);
    res.status(500).json({ error: "Could not save your reflection.", detail: err.message });
  }
});

/* -------------------- Paid-tier luxury gift claim (P1) --------------------
 *
 * The paid report screen offers a free $75 luxury gift to members. This
 * endpoint captures the member's email (and optional shipping address) so
 * the Empress team can fulfil the gift. Persists via lib/notify.js.
 */
app.post("/api/gift/claim", async (req, res) => {
  try {
    const { notify } = require("./lib/notify");
    const { firstName, email, shippingAddress, tier } = req.body || {};

    const e = typeof email === "string" ? email.trim() : "";
    if (!e) return res.status(400).json({ error: "email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: "email does not look valid" });
    }
    if (e.length > 200) return res.status(400).json({ error: "email too long" });

    await notify("gift", {
      firstName: typeof firstName === "string" ? firstName.slice(0, 80) : null,
      email: e,
      shippingAddress:
        typeof shippingAddress === "string" ? shippingAddress.slice(0, 600) : null,
      tier: tier === "free" || tier === "paid" ? tier : null,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[gift] persist failed:", err);
    res.status(500).json({ error: "Could not save your gift claim.", detail: err.message });
  }
});

/* -------------------- Refer a friend (F5) --------------------
 *
 * Free-tier report screen exposes a Refer-a-friend card. We persist the
 * friend's name + email so the Empress team can follow up. No auto-email is
 * sent to the friend at this stage (per product decision).
 */
app.post("/api/referral/submit", async (req, res) => {
  try {
    const { notify } = require("./lib/notify");
    const { friendName, friendEmail, referrerFirstName, tier, note } = req.body || {};

    const name = typeof friendName === "string" ? friendName.trim() : "";
    const email = typeof friendEmail === "string" ? friendEmail.trim() : "";

    if (!name) return res.status(400).json({ error: "friendName is required" });
    if (!email) return res.status(400).json({ error: "friendEmail is required" });
    // Permissive email shape check — the team will follow up manually.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "friendEmail does not look valid" });
    }
    if (name.length > 120 || email.length > 200) {
      return res.status(400).json({ error: "friendName or friendEmail too long" });
    }

    await notify("referral", {
      friendName: name,
      friendEmail: email,
      referrerFirstName:
        typeof referrerFirstName === "string" ? referrerFirstName.slice(0, 80) : null,
      tier: tier === "free" || tier === "paid" ? tier : null,
      note: typeof note === "string" ? note.slice(0, 500) : null,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[referral] persist failed:", err);
    res.status(500).json({ error: "Could not save your referral.", detail: err.message });
  }
});

/* -------------------- Paid 20-Page Report PDF (B2 deliverable) --------------------
 *
 * Renders /assessment/?tier=paid in headless Chromium and streams the PDF
 * back to the client. The on-screen layout and the downloaded PDF are
 * intentionally byte-identical — we render the same React tree.
 *
 * Hero photos for the report sections live in /public/report-heroes/
 * (each is optional and the screen falls back gracefully if missing).
 *
 * GET /api/report/pdf
 *   - User must be authenticated (session cookie).
 *   - Response: application/pdf with Content-Disposition: attachment.
 *
 * Implementation note: this route launches a browser per request, which
 * is acceptable for paid-tier traffic but should be replaced with a
 * persistent browser pool if usage scales. Playwright's `chromium.connect`
 * + a long-lived launcher is the standard pattern.
 */
app.get("/api/report/pdf", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { generatePaidReportPdf } = require("./lib/reportPdfGenerator");

    // Build the base URL the headless browser should navigate to.
    // Prefer the request's origin so this works in both local dev and prod.
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const pdf = await generatePaidReportPdf({
      baseUrl,
      sessionCookie: req.headers.cookie,
      userId: req.session.userEmail,
    });

    const firstName = (req.session.userFirstName || "")
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 40);
    const filename = firstName
      ? `Empress-HealthIntelligenceReport-${firstName}.pdf`
      : "Empress-Health-Intelligence-Report.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(pdf);
  } catch (err) {
    console.error("[report-pdf] generation failed:", err);
    res.status(500).json({
      error: "Could not generate report PDF.",
      detail: err && err.message ? err.message : String(err),
    });
  }
});

app.post("/api/assessment/free-report", async (req, res) => {
  // Free Mini / 30-question free assessment is temporarily disabled.
  // The .docx generator (lib/freeReportGenerator.js) and original handler
  // are intentionally left in place so this can be re-enabled by restoring
  // the original implementation below.

  // Completion gate — runs even when enabled
  const freeReportResponses = req.body?.responses || req.body?.answers || null;
  if (freeReportResponses) {
    const completionPercent = computeCompletionPercent(freeReportResponses);
    if (completionPercent < 0.6) {
      return res.status(422).json({
        error:             "Assessment incomplete",
        completionPercent: Math.round(completionPercent * 100) / 100,
        message:           "Please answer at least 60% of questions before generating the report.",
      });
    }
  }

  return res.status(410).json({
    error: "The free report is temporarily unavailable.",
    code: "FREE_TIER_DISABLED",
  });

  /* --- Original implementation (restore to re-enable free-tier .docx) ---
  try {
    const { generateFreeReport } = require("./lib/freeReportGenerator");
    const data = req.body || {};
    const buffer = await generateFreeReport(data);
    const firstName = (data.user && data.user.firstName ? String(data.user.firstName) : "")
      .replace(/[^A-Za-z0-9_-]/g, "")
      .slice(0, 40);
    const filename = firstName
      ? `Empress-Report-${firstName}.docx`
      : "Empress-Personal-Report.docx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-store");
    res.send(buffer);
  } catch (err) {
    console.error("[free-report] generation failed:", err);
    res.status(500).json({ error: "Could not generate report.", detail: err.message });
  }
  */
});

/* -------------------- Product Recommendations (FastAPI: /product-recommendations) --------------------
 *
 * Paid report only. Builds a single `user_input` string out of the assessment
 * payload (priorities, symptoms, profile) and forwards it to FastAPI's
 * `/product-recommendations` endpoint, which does RAG retrieval against the
 * curated Empress product knowledge base.
 *
 * Contract (per FastAPI spec screenshot):
 *   Request body: { "user_input": "string" }
 *   Response:     { "response": "string", "products": ["string", ...],
 *                   "retrieved_documents_count": 0 }
 *
 * When FastAPI is unreachable we return a 503 with a short curated fallback so
 * the report never renders an empty Section 07.
 */
async function callFastAPIProductRecommendations(userInput, requestId = "") {
  const url = `${FASTAPI_URL}/product-recommendations`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FASTAPI_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: userInput }),
      signal: controller.signal,
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error(`FastAPI returned invalid JSON: ${err.message}`);
    }
    if (!response.ok) {
      const detail = data?.detail || text || `status ${response.status}`;
      throw new Error(`FastAPI product-recommendations error: ${detail}`);
    }
    console.log(`[${requestId}] ✅ FastAPI product-recommendations response received`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function buildProductUserInput(body) {
  if (!body || typeof body !== "object") return "peri+ menopause support";
  const parts = [];
  const priorities = Array.isArray(body.priorities) ? body.priorities : [];
  if (priorities.length) {
    const titles = priorities
      .map((p) => (p && (p.title || p.slug)) || null)
      .filter(Boolean);
    if (titles.length) parts.push(`Top priority areas: ${titles.join(", ")}.`);
  }
  const profile = body.profile || {};
  if (profile.symptoms) parts.push(`Symptoms: ${profile.symptoms}.`);
  if (profile.goals) parts.push(`Goals: ${profile.goals}.`);
  if (profile.preferences) parts.push(`Preferences: ${profile.preferences}.`);
  if (typeof body.overall === "number") parts.push(`Overall Health Intelligence score: ${body.overall}/100.`);
  if (parts.length === 0) {
    return "Recommend products for peri+ menopause hormonal, sleep, and metabolic support.";
  }
  return parts.join(" ");
}

async function handleProductRecommendations(req, res) {
  const requestId = `prod-${Date.now().toString(36)}`;
  try {
    // ── Completion gate (runs before auth — validates payload shape only) ─
    const bodyResponses = req.body?.responses || req.body?.answers || null;
    if (bodyResponses) {
      const completionPercent = computeCompletionPercent(bodyResponses);
      if (completionPercent < 0.6) {
        return res.status(422).json({
          error:             "Assessment incomplete",
          completionPercent: Math.round(completionPercent * 100) / 100,
          message:           "Please answer at least 60% of questions before generating recommendations.",
        });
      }
    }

    const authToken = requireAuthToken(req, res);
    if (!authToken || typeof authToken !== "string") return;

    const userInput =
      (req.body && typeof req.body.user_input === "string" && req.body.user_input.trim()) ||
      buildProductUserInput(req.body || {});

    // Try FastAPI first; if unavailable, fall back to curated catalog
    let fastapiData = null;
    try {
      fastapiData = await callFastAPIProductRecommendations(userInput, requestId);
    } catch (fastapiErr) {
      console.warn(`[${requestId}] FastAPI product-recommendations unavailable:`, fastapiErr.message);
    }

    if (fastapiData) {
      // Validate FastAPI response conforms to expected shape; fall through if not
      const fastapiProducts = Array.isArray(fastapiData.products) ? fastapiData.products : [];
      if (fastapiProducts.length > 0) {
        return res.json({
          success:                   true,
          source:                    "fastapi",
          products:                  fastapiProducts,
          response:                  typeof fastapiData.response === "string" ? fastapiData.response : "",
          retrieved_documents_count: Number(fastapiData.retrieved_documents_count || 0),
        });
      }
    }

    // ── Catalog fallback ───────────────────────────────────────────────────
    const body                = req.body || {};
    const priorityCategories  = Array.isArray(body.priorityCategorySlugs) ? body.priorityCategorySlugs
      : (Array.isArray(body.priorities) ? body.priorities.map((p) => p?.slug || p).filter(Boolean) : []);
    const stage               = body.stage || body.profile?.stage || "perimenopause";
    const userContext         = {
      stage,
      mhtActive: body.mhtActive || false,
      age:       Number(body.age || body.profile?.age || 0),
    };

    const catalogData = await generateRecommendations(
      { ...body, priorityCategorySlugs: priorityCategories, stage, ...userContext },
      requestId
    );

    return res.json({
      success:    true,
      source:     "catalog",
      products:   catalogData.recommendations.map((r) => r.product_name),
      recommendations: catalogData.recommendations,
      clinician:  catalogData.clinician,
      retrieved_documents_count: 0,
    });

  } catch (err) {
    console.error("Product recommendations error:", err);
    return res.status(500).json({
      error: "Failed to generate product recommendations",
      detail: err.message,
    });
  }
}

app.get("/api/recommendations/products", handleProductRecommendations);
app.post("/api/recommendations/products", handleProductRecommendations);

// ─────────────────────────────────────────────────────────────────────────
// Chatbot evaluation: free-text notes captured by AssessmentNotesScreen
// (the post-questions step on the paid assessment flow).
//
// SCAFFOLD: this stub accepts the payload, logs a redacted summary, and
// returns 202 Accepted. Downstream wiring to the actual chatbot evaluator
// can be plumbed in later — the client (AssessmentFlow.tsx) is already
// firing the POST in a fire-and-forget pattern so any non-2xx response
// just gets recorded in the apiResult.errors array without blocking the
// report from rendering.
//
// Payload shape:
//   { source, tier, user, stage, mhtActive, additionalNotes,
//     currentMedications, overall, categoryScores, priorities, responses }
// ─────────────────────────────────────────────────────────────────────────
app.post("/api/chatbot/assessment-notes", (req, res) => {
  try {
    const body = req.body || {};
    // Log a redacted summary only — never log the free-text fields verbatim
    // since they may contain medication names and other PII-adjacent data.
    console.log("📝 /api/chatbot/assessment-notes received:", {
      tier: body.tier,
      stage: body.stage,
      mhtActive: body.mhtActive,
      hasNotes: typeof body.additionalNotes === "string" && body.additionalNotes.length > 0,
      notesLen: typeof body.additionalNotes === "string" ? body.additionalNotes.length : 0,
      hasMeds: typeof body.currentMedications === "string" && body.currentMedications.length > 0,
      medsLen: typeof body.currentMedications === "string" ? body.currentMedications.length : 0,
      overall: body.overall,
      firstName: body.user && body.user.firstName ? body.user.firstName : null,
    });
    res.status(202).json({ ok: true, queued: true });
  } catch (err) {
    console.error("chatbot/assessment-notes error:", err);
    res.status(500).json({ ok: false, error: "internal_error" });
  }
});

// Catch-all proxy route for other /api/recommendations/* routes
app.use("/api/recommendations", async (req, res) => {
  try {
    // Check authentication
    const authToken = requireAuthToken(req, res);
    if (!authToken || typeof authToken !== 'string') {
      return; // requireAuthToken already sent the error response
    }

    // Construct backend URL: transform /api/recommendations/X to /api/v1/recommendations/X
    const suffix = req.path.replace(/^\/api\/recommendations/, '');
    if (suffix.includes('..') || /^https?:/i.test(suffix)) {
      return res.status(400).json({ error: 'invalid path' });
    }
    const backendUrl = `${RENDER_BASE_URL}/api/v1/recommendations${suffix}`;
    console.log("➡️ Forwarding to backend:", backendUrl);

    // Forward request to backend
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || `Bearer ${authToken}`
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
    });

    console.log("⬅️ Backend responded with status:", backendResponse.status);

    // Handle response based on content type
    const contentType = backendResponse.headers.get("content-type");
    const text = await backendResponse.text();

    let data;
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr.message);
        return res.status(502).json({
          error: "Invalid JSON response from backend",
          detail: parseErr.message
        });
      }
    } else {
      data = text;
    }

    // 429 from upstream — return consistent JSON so monitoring can distinguish
    if (backendResponse.status === 429) {
      const retryAfter = backendResponse.headers.get("retry-after") || "60";
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        error: "Service temporarily rate-limited",
        retryAfter: parseInt(retryAfter, 10) || 60,
        detail: typeof data === "object" && data?.detail ? data.detail : undefined
      });
    }

    // Return backend response 1:1
    res.status(backendResponse.status).send(data);

  } catch (err) {
    // Handle network errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.name === 'TypeError') {
      console.error("Failed to reach backend server:", err.message);
      return res.status(503).json({
        error: "Failed to reach backend server on Render.",
        detail: err.message
      });
    }

    // Handle other errors
    console.error("Proxy error:", err.message);
    return res.status(500).json({
      error: "Proxy error",
      detail: err.message
    });
  }
});


/* -------------------- Page routes -------------------- */

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/mockdailyaffirmations", (_req, res) => res.redirect("/mockpages/mockdailyaffirmations.html"));
app.get("/mockdailyaffirmations/", (_req, res) => res.redirect(301, "/mockdailyaffirmations"));

app.get("/mockhowitworks", (_req, res) =>
  res.sendFile(path.join(__dirname, "mockpages", "mockhowitworks.html"))
);

app.get("/mockbetaversion", (_req, res) =>
  res.sendFile(path.join(__dirname, "mockpages", "mockbetaversion.html"))
);

app.get("/mockwellnesshub", (_req, res) =>
  res.sendFile(path.join(__dirname, "mockpages", "mockwellnesshub.html"))
);

app.get("/mockmembershipoptions", (_req, res) =>
  res.sendFile(path.join(__dirname, "mockpages", "mockmembershipoptions.html"))
);

app.get("/mockmenopausemonth", (_req, res) =>
  res.sendFile(path.join(__dirname, "mockpages", "mockmenopausemonth.html"))
);

app.get("/founderstory", (_req, res) =>
  res.sendFile(path.join(__dirname, "founderstory.html"))
);
app.get("/membershipoptions", (_req, res) =>
  res.sendFile(path.join(__dirname, "membershipoptions.html"))
);
app.get("/ourstory", (_req, res) =>
  res.sendFile(path.join(__dirname, "ourstory.html"))
);
app.get("/whyempress", (_req, res) =>
  res.sendFile(path.join(__dirname, "whyempresshealth.html"))
);
app.get("/whyempresshealth", (_req, res) =>
  res.sendFile(path.join(__dirname, "whyempresshealth.html"))
);
app.get("/market", (_req, res) =>
  res.sendFile(path.join(__dirname, "market.html"))
);
app.get("/cookies", (_req, res) =>
  res.sendFile(path.join(__dirname, "cookies.html"))
);
app.get("/accessibility", (_req, res) =>
  res.sendFile(path.join(__dirname, "accessibility.html"))
);
app.get("/supplements", (_req, res) =>
  res.sendFile(path.join(__dirname, "supplements.html"))
);
app.get("/membershipsurvey", (_req, res) =>
  res.sendFile(path.join(__dirname, "membershipsurvey.html"))
);
app.get("/privacypolicy", (_req, res) =>
  res.sendFile(path.join(__dirname, "privacypolicy.html"))
);

// ─── Empress Naturals redesign — pretty URLs for the Claude Design bundle ───
// Files live under /pages/*.html. These routes give them clean URLs and let
// us cut over gradually from the legacy pages above to the redesigned ones.
const REDESIGN_PAGES = [
  "our-program",
  "health-assessment",
  "community",
  "marketplace",
  "education",
  "stories",
  "about",
  "faq",
];
for (const slug of REDESIGN_PAGES) {
  app.get(`/r/${slug}`, (_req, res) =>
    res.sendFile(path.join(__dirname, "pages", `${slug}.html`))
  );
}
// New home preview (the redesigned landing page from the bundle).
app.get("/r", (_req, res) =>
  res.sendFile(path.join(__dirname, "pages", "index.html"))
);
app.get("/r/", (_req, res) =>
  res.sendFile(path.join(__dirname, "pages", "index.html"))
);
app.get("/skincare", (_req, res) =>
  res.sendFile(path.join(__dirname, "skincare.html"))
);
app.get("/selfcaretools", (_req, res) =>
  res.sendFile(path.join(__dirname, "selfcaretools.html"))
);
app.get("/bundlesandkits", (_req, res) =>
  res.sendFile(path.join(__dirname, "bundlesandkits.html"))
);
app.get("/menopausemonth", (_req, res) =>
  res.sendFile(path.join(__dirname, "menopausemonth.html"))
);
app.get("/haircare", (_req, res) =>
  res.sendFile(path.join(__dirname, "haircare.html"))
);
app.get("/communitystories", (_req, res) =>
  res.sendFile(path.join(__dirname, "communitystories.html"))
);
app.get("/community", (_req, res) =>
  res.sendFile(path.join(__dirname, "community.html"))
);
app.get("/login", (_req, res) =>
  res.sendFile(path.join(__dirname, "login.html"))
);
app.get("/expertblogs", (_req, res) =>
  res.sendFile(path.join(__dirname, "public/expertblogs.html"))
);
app.get("/dailyaffirmations", (_req, res) =>
  res.sendFile(path.join(__dirname, "dailyaffirmations.html"))
);
app.get("/betacomingsoon", (_req, res) =>
  res.sendFile(path.join(__dirname, "betacomingsoon.html"))
);
app.get("/wellnesshub", (_req, res) =>
  res.sendFile(path.join(__dirname, "wellnesshub.html"))
);
app.get("/betaversion", (_req, res) =>
  res.sendFile(path.join(__dirname, "betaversion.html"))
);
app.get("/howitworks", (_req, res) =>
  res.sendFile(path.join(__dirname, "howitworks.html"))
);
app.get("/expertguidance", (_req, res) =>
  res.sendFile(path.join(__dirname, "expertguidance.html"))
);
app.get("/symptomsupport", (_req, res) =>
  res.sendFile(path.join(__dirname, "symptomsupport.html"))
);
app.get("/ebookguides", (_req, res) =>
  res.sendFile(path.join(__dirname, "ebookguides.html"))
);
app.get("/contact", (_req, res) =>
  res.sendFile(path.join(__dirname, "contact.html"))
);
app.get("/askempress", (_req, res) =>
  res.sendFile(path.join(__dirname, "askempress.html"))
);
app.get("/events", (_req, res) =>
  res.sendFile(path.join(__dirname, "events.html"))
);
app.get("/faq", (_req, res) =>
  res.sendFile(path.join(__dirname, "faq.html"))
);
app.get("/team", (_req, res) =>
  res.sendFile(path.join(__dirname, "team.html"))
);
app.get("/comingsoon", (_req, res) =>
  res.sendFile(path.join(__dirname, "betacomingsoon.html"))
);
app.get("/signup", (req, res) => {
  // Check if user is already authenticated
  console.log('🔍 Checking authentication for /signup');
  console.log('  Session ID:', req.sessionID);
  console.log('  Session userId:', req.session?.userId);
  console.log('  Session keys:', req.session ? Object.keys(req.session) : 'no session');

  // Never cache the signup page. On Render the proxy/browser otherwise
  // revalidate the ETag and return 304 Not Modified — serving a stale page
  // (often an old cached redirect), which blocks repeated test signups.
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Allow repeated signups in one session for testing (set on Render too,
  // independent of NODE_ENV). Outside production we always allow it.
  const allowRepeatSignup =
    process.env.ALLOW_REPEAT_SIGNUP === "1" ||
    process.env.ALLOW_REPEAT_SIGNUP === "true";

  if (req.session && req.session.userId && isProduction && !allowRepeatSignup) {
    // Production: an authenticated visitor hitting /signup goes straight to
    // the paid assessment, matching the post-login redirect target.
    console.log('✅ User already authenticated, redirecting to /assessment/?tier=paid');
    return res.redirect("/assessment/?tier=paid");
  }

  console.log('✅ Serving signup page (auth redirect skipped: dev or ALLOW_REPEAT_SIGNUP)');
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/membershipsurvey", (req, res) => {
  // Check if user is authenticated
  console.log('🔍 Checking authentication for /membershipsurvey');
  console.log('  Session ID:', req.sessionID);
  console.log('  Session userId:', req.session?.userId);
  console.log('  Session keys:', req.session ? Object.keys(req.session) : 'no session');

  if (!req.session.userId) {
    console.log('⚠️  No userId in session, redirecting to /signup');
    return res.redirect("/signup");
  }

  console.log('✅ User authenticated, serving survey page');
  res.sendFile(path.join(__dirname, "membershipsurvey.html"));
});
app.get("/mockindex", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockindex.html"));
});

app.get("/mockindex2", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockhome.html"));
});

app.get("/mockourstory", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockourstory.html"));
});

app.get("/mockwhyempress", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockwhyempress.html"));
});

app.get("/mockfounder", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockfounder.html"));
});

app.get("/mockteam", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockteam.html"));
});

app.get("/mockwhatsempress", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockwhatempress.html"));
});

app.get("/mockevents", (_req, res) => {
  res.sendFile(path.join(__dirname, "mockpages", "mockevents.html"));
});

app.get("/mockprivacypolicy", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockprivacypolicy"));
});

app.get("/mocksymptomsupport", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mocksymptomsupport.html"));
});

app.get("/mockexpertguidance", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockexpertguidance.html"));
});

app.get("/mockexpertblogs", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockexpertblogs.html"));
});

app.get("/mockebookguides", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockebookguides.html"));
});

app.get("/mockcommunitystories", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockcommunitystories.html"));
});

app.get("/mockhaircare", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.sendFile(path.join(__dirname, "mockpages", "mockhaircare.html"));
});

// Optional short URL aliases (redirect to the canonical page)
// (Make sure these don't point to themselves)
app.get("/founder", (_req, res) => res.redirect(301, "/founderstory"));
app.get("/membership", (_req, res) => res.redirect(301, "/membershipoptions"));

// ─── Daily Affirmation Routes ─────────────────────────────────────────────────

// POST /api/affirmations/subscribe — opt-in a user
app.post("/api/affirmations/subscribe", express.json(), async (req, res) => {
  const authToken = requireAuthToken(req, res);
  if (!authToken) return;

  const { email, profile } = req.body || {};
  if (!email || !profile) {
    return res.status(400).json({ error: "email and profile are required" });
  }

  try {
    const result = await dailyAffirmations.subscribe({ ...profile, email });
    return res.json({
      subscriberId: result.subscriberId,
      nextSendAt: result.nextSendAt,
    });
  } catch (err) {
    console.error("[/api/affirmations/subscribe] error:", err.message);
    return res.status(500).json({ error: "Failed to subscribe", detail: err.message });
  }
});

// GET /api/affirmations/preferences — current subscription status
app.get("/api/affirmations/preferences", async (req, res) => {
  const authToken = requireAuthToken(req, res);
  if (!authToken) return;

  // Try to identify the user's email via session or auth token
  const email = req.session?.userEmail || req.query.email;
  if (!email) {
    return res.json({ subscribed: false });
  }

  try {
    const sub = await dailyAffirmations.getSubscriberByEmail(email);
    if (!sub) return res.json({ subscribed: false });
    return res.json({
      subscribed: true,
      subscriberId: sub.subscriberId,
      nextSendAt: sub.nextSendAt,
    });
  } catch (err) {
    console.error("[/api/affirmations/preferences] error:", err.message);
    return res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// GET /api/affirmations/unsubscribe?token=... — public, email-client safe
app.get("/api/affirmations/unsubscribe", async (req, res) => {
  const token = req.query.token;
  let ok = false;
  if (token) {
    try {
      const result = await dailyAffirmations.unsubscribe(token);
      ok = result.ok;
    } catch (err) {
      console.error("[/api/affirmations/unsubscribe] error:", err.message);
    }
  }

  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribed — Empress Health</title>
  <style>
    body { font-family: Georgia, serif; background: #fdf8f5; color: #333; display: flex;
           align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { max-width: 480px; text-align: center; padding: 48px 32px; }
    h1 { color: #6b2d5e; font-size: 1.6rem; margin-bottom: 16px; }
    p { font-size: 1rem; color: #555; line-height: 1.6; }
    a { color: #6b2d5e; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${ok ? "You've been unsubscribed." : "Link not found."}</h1>
    <p>${ok
      ? "We're sorry to see you go — you can re-subscribe anytime in your dashboard."
      : "This unsubscribe link may have already been used. If you're still receiving emails, please contact support."
    }</p>
    <p><a href="/">Return to Empress Health</a></p>
  </div>
</body>
</html>`);
});

// Unmatched /api/* — return JSON 404 for API clients and monitoring
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found", path: req.originalUrl });
  }
  next();
});

// KEEP THIS LAST — 404 fallback to home (or your 404 page)
app.use((req, res) => {
  if (req.path.startsWith("/assessment")) {
    return res
      .status(404)
      .type("html")
      .send(
        "<!DOCTYPE html><html><body style='font-family:system-ui;padding:2rem'><h1>Not found</h1><p>Try <a href=\"/assessment/\">/assessment/</a></p></body></html>"
      );
  }
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT}`);

  // Start daily affirmation scheduler (runs every hour, no external cron needed)
  try {
    dailyAffirmations.startScheduler();
    console.log("✅ Daily affirmation scheduler started");
  } catch (err) {
    console.error("❌ Failed to start daily affirmation scheduler:", err.message);
  }
});
