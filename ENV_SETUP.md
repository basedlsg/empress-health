# Environment Variables Setup Guide

## Required: Create `.env` file

Create a `.env` file in the `Empress-Health-Node.js` directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (change in production)
SESSION_SECRET=empress-health-secret-key-change-in-production

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_SSL=false

# Upstream Services
RENDER_BASE_URL=https://empress-health-backend.onrender.com
FASTAPI_URL=http://localhost:8001
MVP_AI_URL=http://localhost:8000
FASTAPI_TIMEOUT_MS=15000

# OpenAI API Configuration (if used)
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Empress Chat Secret
EMPRESS_CHAT_SECRET=your_empress_chat_secret_here

# Contact form Zapier webhook (server-side proxy — keeps URL off the client)
# Omit to disable the contact form (returns 503). See POST /api/contact in server.js.
ZAPIER_CONTACT_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID/

# Shopify Storefront API
SHOP_DOMAIN=your-shop.myshopify.com
STOREFRONT_TOKEN=your_storefront_access_token
```

## Affirmations fallback chain

`GET /api/recommendations/affirmations/generate` follows this order:

1. Render backend: `/api/v1/recommendations/affirmations/generate`
2. FastAPI integration: `${FASTAPI_URL}/api/recommendations/generate`
3. Empress-MVP-AI-v2:
   - `${MVP_AI_URL}/affirmations`
   - then `${MVP_AI_URL}/affirmations-bypass`
4. Groq fallback (`GROQ_API_KEY`)

Expected Empress-MVP-AI-v2 contract:

- `POST /affirmations` with `{ "categories": ["Calmness", "Health"] }`
- `POST /affirmations-bypass` with `{ "categories": ["Calmness", "Health"] }`
- Response includes `affirmations` array.

## Grounded Retrieval (Pinecone + Embeddings)

The `lib/retrieval.js` module powers all downstream LLM context injection
(affirmations, recommendations, chatbot, report citations). It operates in
two modes — both return the same shape.

```env
# ── Pinecone (production) ──────────────────────────────────────────────────
# When both are set, retrieval uses live Pinecone queries.
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=empress-clinical-framework   # default if omitted

# ── OpenAI Embeddings (recommended for prod-quality retrieval) ─────────────
# text-embedding-3-small (1536-dim, cheap). Used by:
#   - seed:embed   — to generate stored embeddings for the 25-chunk seed
#   - lib/retrieval.js — to embed incoming queries at runtime
# If absent, both scripts fall back to a deterministic local n-gram
# embedding (768-dim). Retrieval still works but is less semantically aware.
OPENAI_API_KEY=your_openai_api_key_here          # already declared above
```

### Retrieval scripts

| Script | Command | Purpose |
|--------|---------|---------|
| enrich seed | `npm run seed:enrich` | Adds metadata (domains, Q#s, system tags, stage, clinical topics) to the 25-chunk seed file → `pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json` |
| embed seed | `npm run seed:embed` | Generates embeddings → `data/pinecone-embeddings.json`. Uses OpenAI if key set, else local fallback. |
| upsert | `npm run seed:upsert` | Pushes embeddings into Pinecone. Requires `PINECONE_API_KEY`. |
| test | `npm run retrieval:test` | Runs 6 fixed clinical queries and checks domain routing. |

### Local-first dev setup (no API keys needed)

```bash
npm run seed:enrich    # annotate chunks
npm run seed:embed     # build local embeddings (n-gram fallback)
npm run retrieval:test # verify retrieval is working
```

## Daily affirmation emails

Empress Health sends each opted-in user a personalised, clinically grounded affirmation every morning. Users opt in during onboarding by the client POSTing to `POST /api/affirmations/subscribe` with their `email` and `profile` (see route definition in `server.js`).

### Opt-in flow

1. After onboarding completes, the frontend POSTs:
   ```
   POST /api/affirmations/subscribe
   X-CSRF-Token: <token>
   { "email": "user@example.com", "profile": { ...userProfile } }
   ```
2. The server stores the subscription and returns `{ subscriberId, nextSendAt }`.
3. The scheduler (running in-process every hour) picks up due subscribers and sends the email.

### SMTP environment variables

Add these to your `.env` to enable real email delivery. Without them, sends go to `email_outbox.log` in the project root for dev verification.

```env
# SMTP — leave blank to use file-log stub (dev mode)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxx
SMTP_FROM=affirmations@empress.health
```

Supported providers: SendGrid (recommended), Mailgun, Postmark, AWS SES, or any standard SMTP host.

### Dev verification (no SMTP)

When `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are not set, every outgoing email is appended as a JSONL line to `./email_outbox.log`:

```jsonl
{"timestamp":"2026-05-24T09:00:00.000Z","to":"user@example.com","subject":"Your Empress affirmation for Sunday, May 24, 2026","snippet":"[MOCK] When the signal rises...","messageId":"uuid","mode":"log","unsubUrl":"http://localhost:3000/api/affirmations/unsubscribe?token=..."}
```

Run `npm run test:daily` (requires `MOCK_LLM=1`, already set in the script) to exercise the full pipeline against `email_outbox.log`.

### Scheduler

The scheduler starts automatically at server boot — no external cron or queue is needed. It runs once per hour and processes due subscribers serially to avoid burst sending. It can be stopped programmatically with `dailyAffirmations.stopScheduler()`.

## Important Notes

- Never commit `.env` files to version control
- The `.env` file should be in the same directory as `server.js`
- Restart the server after adding/modifying environment variables

