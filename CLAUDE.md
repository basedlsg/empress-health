# Empress Health — Claude Code context

A menopause support platform: clinical assessment + grounded reports + marketplace + community.

## Read first for any design work

This project is **design-ready** (prepared via the `design-ready` skill). Before any visual change, read these three files in order:

1. [`BRAND_BRIEF.md`](./BRAND_BRIEF.md) — purpose, audience, tone, constraints, the one differentiator
2. [`DESIGN.md`](./DESIGN.md) — colour, typography, spacing, components, motion, voice
3. [`COMPONENT_INVENTORY.md`](./COMPONENT_INVENTORY.md) — what already exists (reuse before reinvent)

Visual ground truth: PNG snapshots of every key page live in [`design-references/screenshots/`](./design-references/screenshots/). Refresh with `npm run design:snapshot` (server must be on `localhost:3100`).

Short-form pointer: [`.claude/design-context.md`](./.claude/design-context.md).

## Read first for any backend work

- Grounded-pipeline architecture: [`GROUNDING_REPORT.md`](./GROUNDING_REPORT.md)
- Open bugs / fixes log: [`RELEASE_BUG_REPORT.md`](./RELEASE_BUG_REPORT.md)

## Quick facts

- **Stack:** Node 22 + Express 5 (server.js), static HTML for marketing, React 19 + Vite 6 SPA in `prds/`
- **Dev port:** 3100 (Docker squats 3000)
- **Boot:** `PORT=3100 NODE_ENV=development SESSION_SECRET=dev-... MOCK_LLM=1 node server.js`
- **All tests:** `MOCK_LLM=1 node scripts/test-*.mjs` + `npm run test:his` (110+ assertions across 7 suites)
- **Build SPA:** `npm run build:assessment`
- **Pricing:** $139 one-time / $12 monthly installment for the paid HI report

## Do not touch when doing design work

- `server.js` (except adding a new `app.get("/route", ...)` line)
- `lib/*` (retrieval, catalog, affirmations, qa, daily-affirmations, email-sender, csrf, sanitise, freeReportGenerator, reportPdfGenerator, notify)
- `prds/hisEngine.ts`, `prds/hisNarratives.ts`, `prds/assessmentQuestions.ts`, `prds/assessmentScoring.ts`
- `data/product_catalog.json`, `data/clinician_taxonomy.json`, `data/pinecone-embeddings.json`
- `pinecone_data/*`

## The one thing that defines this brand

Every clinical claim cites a Pinecone chunk — visibly, in the UI, on every card. Citation footers are not polish; they're the brand. See `BRAND_BRIEF.md` § 5.
