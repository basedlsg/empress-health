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

## Local Stripe membership checkout

The account page offers Essential ($9/month) and Premium ($19/month). The server
creates Stripe Checkout Sessions and only activates a membership after a
signature-verified webhook confirms the subscription. Store the test key and
webhook secret in the ignored `.env` file, never in browser code:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PORTAL_CONFIGURATION_ID=bpc_...
PUBLIC_SITE_URL=http://localhost:3100
DATABASE_URL=postgresql://localhost:5432/empress_health_local
```

The local Postgres database must exist before starting the server. On a Mac
with Postgres running, `createdb empress_health_local` creates a separate
development database. Start the site with `npm start`, then keep a second
terminal open for the Stripe CLI listener:

```bash
npm run stripe:listen
```

Use the listener's `whsec_...` value for `STRIPE_WEBHOOK_SECRET` and restart
the site. The CLI must keep running while testing Checkout locally. Set up a
test billing portal configuration in the Stripe Dashboard (card updates,
invoice history, and cancellation) and put its `bpc_...` ID in `.env`.
Production requires its own Stripe credentials and a publicly accessible
HTTPS webhook endpoint with its own signing secret.

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
PINECONE_INDEX_NAME=empress
PINECONE_NAMESPACE=clinical-framework
PINECONE_EMBED_MODEL=llama-text-embed-v2
PINECONE_EMBED_DIM=768

# Pinecone generates query and passage embeddings using the same hosted model.
# No OpenAI key is required for the live Pinecone path.
# Without PINECONE_API_KEY, retrieval uses the local embeddings file instead.
```

### Retrieval scripts

| Script | Command | Purpose |
|--------|---------|---------|
| enrich seed | `npm run seed:enrich` | Adds metadata (domains, Q#s, system tags, stage, clinical topics) to the 25-chunk seed file → `pinecone_data/empress-120-symptom-biomarker-framework-records.enriched.json` |
| embed seed | `npm run seed:embed` | Generates embeddings → `data/pinecone-embeddings.json`. Uses OpenAI if key set, else local fallback. |
| upsert | `npm run seed:upsert` | Embeds full enriched passages via Pinecone Inference, then upserts to the configured index/namespace. Loads `.env`; requires `PINECONE_API_KEY`. |
| test | `npm run retrieval:test` | Runs 6 fixed clinical queries and checks domain routing. |

### Local-first dev setup (no API keys needed)

```bash
npm run seed:enrich    # annotate chunks
npm run seed:embed     # build local embeddings (n-gram fallback)
npm run retrieval:test # verify retrieval is working
```

## Ask Empress

The interactive site page is `/ask-empress.html` (or `/ask-empress` with clean
URLs). Its source lives in `redesign-preview/ask-empress.html`, with companion
JS/CSS. The build stages these files into `public/`. The legacy `/askempress`
chat also uses the same `POST /qa` endpoint.

Pipeline: question → Pinecone query embedding → `clinical-framework` passages
→ grounded answer model → answer plus retrieved passage excerpts. The model
cannot search the other namespaces or the internet. The 25 framework passages
are reference material; retrieved excerpts are not independent validation of
every generated claim. Each question is independent; there is no conversation
memory or connection to a personal tracker.

The default answer provider is the existing Gemini integration:

```env
MOCK_LLM=0
ASK_EMPRESS_PROVIDER=gemini
GOOGLE_API_KEY=your_google_api_key
# Optional: GEMINI_MODEL=your_supported_model
```

To use an open model through Ollama or another OpenAI-compatible model server:

```env
MOCK_LLM=0
ASK_EMPRESS_PROVIDER=openai-compatible
ASK_EMPRESS_BASE_URL=http://127.0.0.1:11434/v1
ASK_EMPRESS_MODEL=your_installed_instruction_model
# ASK_EMPRESS_API_KEY=your_private_model_server_key  # if required
```

Install Ollama separately, pull the chosen model, and configure it with enough
context for roughly 18,000 characters of retrieved passages plus the prompt.
See [Ollama API compatibility](https://docs.ollama.com/api/openai-compatibility).
No new npm dependency is needed. The model endpoint is called only by the server;
credentials must never appear in browser JavaScript.

For Vercel, `127.0.0.1` means the Vercel function, not your computer. Run the open
model on a separate reachable server and configure its authenticated HTTPS
endpoint and model in the deployment environment, or retain Gemini. Configure
Pinecone credentials there too; the ignored local `.env` is not deployed.

`POST /qa` accepts `{ "query": "..." }` (1–800 characters). It returns
`{ answer, response, sources, status }`; `response` is the legacy answer alias.
Infrastructure/model failures return HTTP 503 with `status: "unavailable"`,
distinct from an evidence gap (`status: "no_evidence"`). Existing public API
rate limits still apply. Do not set `MOCK_LLM=1` in production.

Verification: `npm run test:ask-empress` tests the open model adapter and grounded
failure handling locally, without requiring API credentials. A real end-to-end
check must also confirm retrieval and model generation with deployment credentials.

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
